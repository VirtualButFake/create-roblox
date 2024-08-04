import fs from 'fs';
import os from 'os';
import { ProjectSettings } from '../../cli.js';
import {
    executeCommand,
    getTemplateData,
    writeTemplate,
    getPackagePath,
} from '../../utils.js';

const addSnippet = `

    fs.move("./Packages", "./packages", true)`;

export default async function (settings: ProjectSettings) {
    if (!settings.tools.find((tool) => tool === 'wally')) return;
    if (!settings.wallyMods) return;

    await writeTemplate(['tools', 'wally', 'base']);
    await writeTemplate(['tools', 'wally', settings.projectType]);

    for (const file of fs.readdirSync('./temp')) {
        if (file.endsWith('.project.json')) {
            fs.writeFileSync(
                `./temp/${file}`,
                fs
                    .readFileSync(`./temp/${file}`, 'utf-8')
                    .replaceAll('{{ project_name }}', settings.projectName)
                    .replaceAll('{{ package_path }}', getPackagePath(settings))
            );
        }
    }

    fs.writeFileSync(
        './temp/.lune/install-packages.luau',
        fs
            .readFileSync('./temp/.lune/install-packages.luau', 'utf-8')
            .replace(
                '-- OPTIONAL_RENAME_STATEMENT',
                settings.wallyMods.includes('lowercaseNames') ? addSnippet : ''
            )
    );

    const wallyPackages = getTemplateData().packages;

    fs.writeFileSync(
        './temp/wally.toml',
        `[package]\nname = "${os.userInfo().username}/${settings.projectName
            .toLowerCase()
            .replace(
                /[^a-zA-Z0-9]/g,
                ''
            )}"\nversion = "0.1.0"\nregistry = "https://github.com/UpliftGames/wally-index"\nrealm = "shared"\n\n[dependencies]\n${wallyPackages.join(
            '\n'
        )}`
    );

    await executeCommand('lune', ['run', 'install-packages'], {
        cwd: './temp',
        stdio: 'inherit',
    });
}
