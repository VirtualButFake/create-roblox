/* eslint no-var: 0, no-control-regex: 0 */
import { input, select, checkbox, confirm, Separator } from '@inquirer/prompts';

type Question = {
    type: string;
    name: string;
    message: string;
    validate?: (input: string) => boolean | string;
    choices?: // typedef copied over from inquirer
    | readonly (string | Separator)[]
        | readonly (
              | Separator
              | { value: string; name?: string; short?: string; key?: string }
          )[];
    when?: () => boolean;
};

type Answer = any;

type ReactiveQuestion = {
    question: Question;
    completed: (answer: string | any) => Promise<void>;
};

export type Questions = (Question | ReactiveQuestion)[];

const packages: { common: string[]; game: string[]; package: string[] } = {
    common: [],
    game: ['Zap', 'Cmdr'],
    package: [],
};

export interface ProjectSettings {
    projectName: string;
    projectType: 'game' | 'package';
    language: 'rbxts' | 'luau';
    ui?: 'fusion' | 'react' | 'vide' | 'none';
    storybookPlugin?: 'hoarcekat' | 'flipbook' | 'uiLabs' | 'none';
    tools: string[];
    wallyMods?: string[];
    darkluaMods?: string[];
    ci: boolean;
    git: boolean;
    packages: string[];
}

const answers: {
    [key: string]: Answer;
} = {};

async function ask(question: Question): Promise<Answer> {
    switch (question.type) {
        case 'input':
            return await input({
                message: question.message,
                validate: question.validate,
            });
        case 'select':
            if (!question.choices) {
                throw new Error('No choices provided');
            }

            return await select({
                message: question.message,
                choices: question.choices,
            });
        case 'checkbox':
            if (!question.choices) {
                throw new Error('No choices provided');
            }

            return await checkbox({
                message: question.message,
                choices: question.choices,
            });
        case 'confirm':
            return await confirm({
                message: question.message,
            });
        default:
            return {};
    }
}

async function queue(questions: Questions): Promise<{
    [key: string]: Answer;
}> {
    for (let question of questions) {
        if ('question' in question) {
            question = question as ReactiveQuestion;

            const answer = await ask(question.question);
            Object.assign(answers, {
                [question.question.name]: answer,
            });

            if (question.completed) {
                await question.completed(answer);
            }
        } else {
            const answer = await ask(question);
            Object.assign(answers, {
                [question.name]: answer,
            });
        }
    }

    return answers;
}

export default async function () {
    const settings = (await queue([
        {
            type: 'input',
            name: 'projectName',
            message: 'What would you like to name your project?',
            validate(input) {
                if (
                    input.match(
                        /^(?!(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.[^.]*)?$)[^<>:"/\\|?*\x00-\x1F]*[^<>:"/\\|?*\x00-\x1F .]$/
                    )
                ) {
                    return true;
                }

                return 'Invalid project name - make sure it is a valid windows directory name.';
            },
        },
        {
            type: 'select',
            name: 'projectType',
            message: 'What type of project would you like to create?',
            choices: [
                {
                    name: 'Game',
                    value: 'game',
                },
                {
                    name: 'Package',
                    value: 'package',
                },
            ],
        },
        {
            question: {
                type: 'checkbox',
                name: 'tools',
                message:
                    'What tools would you like to set up with your project?',
                choices: [
                    {
                        name: 'StyLua (make sure to install the vsc extension)',
                        value: 'stylua',
                    },
                    {
                        name: 'Selene (make sure to install the vsc extension)',
                        value: 'selene',
                    },
                    {
                        name: 'Wally',
                        value: 'wally',
                    },
                    {
                        name: 'darklua (recommended)',
                        value: 'darklua',
                    },
                ],
            },
            completed: async (answer: string[]) => {
                if (answer.includes('wally')) {
                    const availablePackages = packages.common
                        .map((pkg) => ({
                            name: pkg,
                            value: pkg.toLowerCase(),
                        }))
                        .concat(
                            packages[
                                answers.projectType as keyof typeof packages
                            ].map((pkg) => ({
                                name: pkg,
                                value: pkg.toLowerCase(),
                            }))
                        );

                    await queue([
                        {
                            type: 'checkbox',
                            name: 'wallyMods',
                            message:
                                'Would you like to add any modifications to Wally?',
                            choices: [
                                {
                                    name: 'Use lowercase packages names (through installation script)',
                                    value: 'lowercaseNames',
                                },
                            ],
                        },
                        {
                            type: 'checkbox',
                            name: 'packages',
                            message: 'Would you like to install any packages?',
                            choices: availablePackages,
                            when: () =>
                                availablePackages.length > 0 &&
                                answer.includes('darklua'),
                        },
                    ]);
                }

                if (answer.includes('darklua')) {
                    await queue([
                        {
                            type: 'checkbox',
                            name: 'darkluaMods',
                            message: 'What should darklua do?',
                            choices: [
                                {
                                    name: 'Inject __DEV__ global',
                                    value: 'injectDev',
                                },
                                {
                                    name: 'Remove unused code (should not affect functionality)',
                                    value: 'removeUnused',
                                },
                                {
                                    name: 'Setup absolute imports (@packages, @client, @common, @server) (recommended)',
                                    value: 'absoluteImports',
                                },
                            ],
                        },
                    ]);
                }
            },
        },
        {
            question: {
                type: 'select',
                name: 'ui',
                message: 'What UI framework would you like to use?',
                choices: [
                    {
                        name: 'None',
                        value: 'none',
                    },
                    {
                        name: 'Fusion 0.2',
                        value: 'fusion0.2',
                    },
                    {
                        name: 'Fusion 0.3',
                        value: 'fusion0.3',
                    },
                    {
                        name: 'React Lua',
                        value: 'react',
                    },
                    {
                        name: 'Vide',
                        value: 'vide',
                    },
                ],
                when: () =>
                    answers.tools.find((tool: string) => tool === 'wally') &&
                    answers.darkluaMods?.includes('absoluteImports'),
            },
            completed: async (answer) => {
                if (answer == 'none' || answer == undefined) return;

                await queue([
                    {
                        type: 'select',
                        name: 'storybookPlugin',
                        message: 'What storybook plugin would you like to use?',
                        choices: [
                            {
                                name: 'None',
                                value: 'none',
                            },
                            {
                                name: 'Hoarcekat',
                                value: 'hoarcekat',
                            },
                            {
                                name: 'Flipbook',
                                value: 'flipbook',
                            },
                            {
                                name: 'UI Labs',
                                value: 'uiLabs',
                            },
                        ],
                    },
                ]);
            },
        },
        {
            question: {
                type: 'confirm',
                name: 'git',
                message:
                    'Would you like to initialize a git repository? (assumes you have Git installed)',
            },
            completed: async (answer) => {
                if (answer) {
                    await queue([
                        {
                            type: 'confirm',
                            name: 'ci',
                            message:
                                'Would you like to setup continuous integration (CI)?',
                            when: () =>
                                answers.tools.includes('selene') ||
                                answers.tools.includes('stylua'),
                        },
                    ]);
                }
            },
        },
    ])) as ProjectSettings;

    global.settings = settings;

    return settings;
}

declare global {
    var settings: ProjectSettings;
}
