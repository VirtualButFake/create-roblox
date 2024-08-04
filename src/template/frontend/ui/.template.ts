import { ProjectSettings } from '../../cli';

export default {
    absolutePaths: async function (settings: ProjectSettings) {
        const basePath = `src/${
            settings.projectType === 'game' ? 'client/' : ''
        }ui`;

        return {
            '@ui': basePath,
            '@components': `${basePath}/components`,
        };
    },
};
