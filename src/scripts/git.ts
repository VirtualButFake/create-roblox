import { ProjectSettings } from '../cli.js';
import { executeCommand, writeTemplate } from '../utils.js';
import fs from 'fs';

export default async function (settings: ProjectSettings) {
    if (!settings.git) return;

    await executeCommand('git', ['init'], {
        cwd: './temp',
        stdio: 'inherit',
    });

    if (!settings.ci) return;

    await writeTemplate(['ci']);
}
