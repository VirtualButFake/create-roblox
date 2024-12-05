import { ProjectSettings } from '../../../cli.js';
import { getPackagePath } from '../../../utils.js';

export default {
    absolutePaths: async function (settings: ProjectSettings) {
        return {
            '@packages': getPackagePath(settings, false),
            '@serverpackages': getPackagePath(settings, true),
        };
    },
};
