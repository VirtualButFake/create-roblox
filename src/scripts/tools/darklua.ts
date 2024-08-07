import { ProjectSettings } from '../../cli.js';
import { writeTemplate, getTemplateData } from '../../utils.js';
import fs from 'fs';

export default async function (settings: ProjectSettings) {
    if (!settings.tools.find((tool) => tool === 'darklua')) return;
    if (!settings.darkluaMods) return;

    await writeTemplate(['tools', 'darklua', 'base']);

    if (settings.darkluaMods.includes('absoluteImports')) {
        const absolutePaths = getTemplateData().absolutePaths;

        for (const mod of settings.darkluaMods) {
            if (mod === 'injectDev') continue;

            await writeTemplate(['tools', 'darklua', mod]);
        }

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

        // set the {{ darklua_config_dev }} string in .lune/dev to ".darklua.json" if "injectDev" is not in the settings. otherwise, set it to ".darklua.dev.json"
        if (settings.darkluaMods.includes('injectDev')) {
            // clone over the darklua config to .darklua.dev.json
            fs.copyFileSync('./temp/.darklua.json', './temp/.darklua.dev.json');

            await writeTemplate(['tools', 'darklua', 'injectDev']);
        }

        fs.writeFileSync(
            './temp/.lune/dev.luau',
            fs
                .readFileSync('./temp/.lune/dev.luau', 'utf-8')
                .replace(
                    '{{ darklua_config_dev }}',
                    !settings.darkluaMods.includes('injectDev')
                        ? '.darklua.json'
                        : '.darklua.dev.json'
                )
        );
    }
}
