import { ProjectSettings } from '../cli.js';
import { runBinary, executeCommand, getTemplateData } from '../utils.js';
import fs from 'fs';
import logger from '../logger.js';

let setupRan = false;

export default async function (settings: ProjectSettings) {
    if (!setupRan) {
        try {
            await executeCommand('aftman', ['--version']);
        } catch (err) {
            logger.info('Did not find Aftman, installing..');
            await runBinary('aftman', 'aftman', ['self-install'], {
                stdio: 'inherit',
                cwd: './temp',
            });
        }

        try {
            await executeCommand('aftman', ['init'], {
                cwd: './temp',
                stdio: 'inherit',
            });
        } catch (err) {
            logger.error('Failed to initialize Aftman:');
            throw err;
        }
    }

    const configString = `[tools]\n${Object.entries(getTemplateData().tools)
        .map(([tool, version]) => `${tool} = "${version}"`)
        .join('\n')}`;

    fs.writeFileSync('./temp/aftman.toml', configString);

    try {
        const response = await executeCommand(
            'aftman',
            ['install', '--no-trust-check'],
            {
                cwd: './temp',
            }
        );

        if (response.status !== 0) {
            throw response.stderr.toString();
        }
    } catch (err) {
        logger.error('Failed to install tools with Aftman:');
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

        logger.info('Installed tools with Aftman');
    }

    setupRan = true;
}
