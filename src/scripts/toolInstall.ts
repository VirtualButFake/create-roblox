import { ProjectSettings } from '../cli.js';
import { runBinary, executeCommand, getTemplateData } from '../utils.js';
import fs from 'fs';
import logger from '../logger.js';

let setupRan = false;

export default async function (settings: ProjectSettings) {
    if (!setupRan) {
        let version;

        try {
            version = await executeCommand('aftman', ['--version']);
        } catch (err) {
            // ignore, we only need to know if it's installed and don't want to do anything if it's not
        }

        if (version) {
            logger.warn(
                "Aftman is installed. This may result in conflicts with Rokit and issues with tool installation. Consider uninstalling Aftman by deleting it's directory in your user folder (.aftman) or an alternative method."
            );
        }

        try {
            await executeCommand('rokit', ['--version']);
        } catch (err) {
            logger.info('Did not find Rokit, installing..');
            await runBinary('rokit', 'rokit', ['self-install'], {
                stdio: 'inherit',
                cwd: './temp',
            });
        }

        try {
            await executeCommand('rokit', ['init'], {
                cwd: './temp',
                stdio: 'inherit',
            });
        } catch (err) {
            logger.error('Failed to initialize Rokit:');
            throw err;
        }
    }

    const configString = `[tools]\n${Object.entries(getTemplateData().tools)
        .map(([tool, version]) => `${tool} = "${version}"`)
        .join('\n')}`;

    fs.writeFileSync('./temp/rokit.toml', configString);

    try {
        const response = await executeCommand(
            'rokit',
            ['install', '--no-trust-check'],
            {
                cwd: './temp',
            }
        );

        if (response.status !== 0) {
            throw response.stderr.toString();
        }
    } catch (err) {
        logger.error('Failed to install tools with Rokit:');
        throw err;
    }

    if (setupRan) {
        if (
            settings.tools.includes('wally') &&
            settings.wallyMods != undefined
        ) {
            await executeCommand('lune', ['run', 'install-packages'], {
                cwd: './temp',
                stdio: 'inherit',
            });
        }

        logger.info('Installed tools with Rokit!');
    }

    setupRan = true;
}
