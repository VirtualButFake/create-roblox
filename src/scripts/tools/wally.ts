import fs from 'fs';
import os from 'os';
import { ProjectSettings } from '../../cli.js';
import { getTemplateData, writeTemplate, getPackagePath } from '../../utils.js';

const addSnippet = `

    local success, result = pcall(function()
        if fs.isDir("./Packages") then
            fs.move("./Packages", "./packages", true)
        end
        
        if fs.isDir("./ServerPackages") then
            fs.move("./ServerPackages", "./ServerPackages", true)
        end
    end)

    if not success then
        warn("Failed to rename package folders (this is generally caused by wally/wally-package-types locking a file in the directory): " .. tostring(result))
    end`;

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
                    .replaceAll(
                        '{{ package_path }}',
                        getPackagePath(settings, false)
                    )
                    .replaceAll(
                        '{{ server_package_path }}',
                        getPackagePath(settings, true)
                    )
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
        `[package]\nname = "${os.userInfo().username.toLowerCase()}/${settings.projectName
            .toLowerCase()
            .replace(
                /[^a-zA-Z0-9]/g,
                ''
            )}"\nversion = "0.1.0"\nregistry = "https://github.com/UpliftGames/wally-index"\nrealm = "shared"\n\n[dependencies]\n${wallyPackages.join(
            '\n'
        )}`
    );
}
