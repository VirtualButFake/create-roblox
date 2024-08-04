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
    fsExtra.moveSync('./temp', oldPath + '/' + settings.projectName);
}

main()
    .then(() => {
        logger.info('Project setup complete!');
    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
