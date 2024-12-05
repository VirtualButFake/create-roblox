import { ProjectSettings } from '../cli.js';
import { writeTemplate } from '../utils.js';

export default async function (settings: ProjectSettings) {
    if (!settings.ui || settings.ui == 'none') return;
    if (!settings.storybookPlugin) return;

    await writeTemplate(
        ['frontend', 'ui', settings.ui],
        settings.projectType === 'game'
            ? './temp/src/client/ui/components'
            : './temp/src/ui/components'
    );

    if (settings.storybookPlugin == 'none') return;

    await writeTemplate(
        ['frontend', 'stories', settings.ui, settings.storybookPlugin],
        `./temp/src/${settings.projectType === 'game' ? 'client/' : ''}ui`
    );
}
