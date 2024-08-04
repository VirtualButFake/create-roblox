import { ProjectSettings } from '../../cli.js';
import { writeTemplate } from '../../utils.js';

export default async function (settings: ProjectSettings) {
    if (!settings.tools.find((tool) => tool === 'stylua')) return;

    await writeTemplate(['tools', 'stylua']);
}
