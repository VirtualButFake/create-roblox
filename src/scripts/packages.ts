import { ProjectSettings } from '../cli.js';
import { writeTemplate } from '../utils.js';

export default async function (settings: ProjectSettings) {
    if (!settings.packages) return;

    for (const pkg of settings.packages) {
        await writeTemplate(['packages', pkg]);
    }
}
