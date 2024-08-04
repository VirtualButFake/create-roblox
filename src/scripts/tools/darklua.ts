import { ProjectSettings } from '../../cli.js';
import { writeTemplate, getTemplateData } from '../../utils.js';
import fs from 'fs';

export default async function (settings: ProjectSettings) {
    if (!settings.tools.find((tool) => tool === 'darklua')) return;
    if (!settings.darkluaMods) return;

    await writeTemplate(['tools', 'darklua', 'base']);

    for (const mod of settings.darkluaMods) {
        await writeTemplate(['tools', 'darklua', mod]);
    }

    if (settings.darkluaMods.includes('absoluteImports')) {
        const absolutePaths = getTemplateData().absolutePaths;

        const darkLuaConfig = JSON.parse(
            fs.readFileSync('./temp/.darklua.json', 'utf-8')
        );
        const ruleToModify = darkLuaConfig.rules.find(
            (rule: any) =>
                typeof rule === 'object' && rule.rule === 'convert_require'
        );

        ruleToModify.current.sources = absolutePaths;

        fs.writeFileSync(
            './temp/.darklua.json',
            JSON.stringify(darkLuaConfig, null, 4)
        );

        // modify vscode config
        const vscodeConfig = JSON.parse(
            fs.readFileSync('./temp/.vscode/settings.json', 'utf-8')
        );
        vscodeConfig['luau-lsp.require.directoryAliases'] = absolutePaths;
        fs.writeFileSync(
            './temp/.vscode/settings.json',
            JSON.stringify(vscodeConfig, null, 4)
        );
    }
}
