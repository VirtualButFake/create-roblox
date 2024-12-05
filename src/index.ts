import fs from 'fs';
import cli from './cli.js';
import logger from './logger.js';
import scripts from './scripts/index.js';
import fsExtra from 'fs-extra/esm';
import path from 'path';
import { executeCommand } from './utils.js';

async function main() {
    const oldPath = process.cwd();
    process.chdir(path.join(__dirname, '..')); // i may or may not have been too lazy to convert all the paths to be relative to the project root etc etc

    if (process.argv.includes('--version')) {
        const packageJson = JSON.parse(
            fs.readFileSync('./package.json', 'utf-8')
        );
        console.log(packageJson.version);
        process.exit(0);
    }

    const settings = await cli();
    logger.info('Initializing project setup..');
    logger.debug('Project Settings: ');
    logger.debug(settings);

    if (fs.existsSync('./temp')) {
        fs.rmSync('./temp', { recursive: true });
    }

    fs.mkdirSync('./temp');

    for (const script of scripts) {
        await script(settings);
    }

    executeCommand('lune', ['run', 'build'], {
        cwd: './temp',
        stdio: 'inherit',
    });

    return new Promise(() => {
        fsExtra
            .move('./temp', oldPath + '/' + settings.projectName)
            .then(() => {
                Promise.resolve();
            })
            .catch((err) => {
                logger.error(
                    'Failed to move project files. Retrying in 5 seconds.. View the error below:'
                );
                logger.error(err.stack);

                setTimeout(() => {
                    fsExtra
                        .move('./temp', oldPath + '/' + settings.projectName)
                        .catch((err) => {
                            logger.error(
                                'Failed to move project files on second attempt. View the error below:'
                            );
                            logger.error(err.stack);
                            Promise.reject(err);
                        });

                    return Promise.resolve();
                }, 5000);
            });
    });
}

main()
    .then(() => {
        logger.info('Project setup complete!');
    })
    .catch((err: Error) => {
        if (err.name.includes('ExitPrompt')) {
            logger.debug('Project setup canceled.');
            process.exit(0);
        }

        logger.error(err.stack);
        process.exit(1);
    });
