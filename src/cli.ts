/* eslint no-var: 0, no-control-regex: 0 */
import inquirer, { Answers, QuestionCollection } from "inquirer";

type ReactiveQuestion = {
	question: QuestionCollection;
	completed: (answer: string | any) => Promise<void>;
};

export type Questions = (QuestionCollection | ReactiveQuestion)[];

const packages: { common: string[]; game: string[]; package: string[] } = {
	common: [],
	game: ["Zap", "Cmdr"],
	package: [],
};

export interface ProjectSettings {
	projectName: string;
	projectType: "game" | "package";
	language: "rbxts" | "luau";
	ui?: "fusion" | "react" | "vide" | "none";
	storybookPlugin?: "hoarcekat" | "flipbook" | "uiLabs" | "none";
	tools: string[];
	wallyMods?: string[];
	darkluaMods?: string[];
	ci: boolean;
	git: boolean;
	packages: string[];
}

const answers: Answers = {};

async function ask(question: QuestionCollection): Promise<Answers> {
	return inquirer.prompt([question]);
}

async function queue(questions: Questions): Promise<Answers> {
	for (let question of questions) {
		if ("question" in question) {
			question = question as ReactiveQuestion;

			const answer = await ask(question.question);
			Object.assign(answers, answer);

			if (question.completed) {
				await question.completed(answer[Object.keys(answer)[0]]);
			}
		} else {
			const answer = await ask(question);
			Object.assign(answers, answer);
		}
	}

	return answers;
}

export default async function () {
	const settings = (await queue([
		{
			type: "input",
			name: "projectName",
			message: "What would you like to name your project?",
			validate(input) {
				if (
					input.match(
						/^(?!(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.[^.]*)?$)[^<>:"/\\|?*\x00-\x1F]*[^<>:"/\\|?*\x00-\x1F .]$/
					)
				) {
					return true;
				}

				return "Invalid project name - make sure it is a valid windows directory name.";
			},
		},
		{
			type: "list",
			name: "projectType",
			message: "What type of project would you like to create?",
			choices: [
				{
					name: "Game",
					value: "game",
				},
				{
					name: "Package",
					value: "package",
				},
			],
		},
		{
			question: {
				type: "checkbox",
				name: "tools",
				message: "What tools would you like to set up with your project?",
				choices: [
					{
						name: "StyLua (make sure to install the vsc extension)",
						value: "stylua",
					},
					{
						name: "Selene (make sure to install the vsc extension)",
						value: "selene",
					},
					{
						name: "Wally",
						value: "wally",
					},
					{
						name: "darklua (recommended)",
						value: "darklua",
					},
				],
			},
			completed: async (answer: string[]) => {
				if (answer.includes("wally")) {
					const availablePackages = packages.common
						.map((pkg) => ({
							name: pkg,
							value: pkg.toLowerCase(),
						}))
						.concat(
							packages[answers.projectType as keyof typeof packages].map(
								(pkg) => ({
									name: pkg,
									value: pkg.toLowerCase(),
								})
							)
						);

					await queue([
						{
							type: "checkbox",
							name: "wallyMods",
							message: "Would you like to add any modifications to Wally?",
							choices: [
								{
									name: "Use lowercase packages names (through installation script)",
									value: "lowercaseNames",
								},
							],
						},
						{
							type: "checkbox",
							name: "packages",
							message: "Would you like to install any packages?",
							choices: availablePackages,
							when: () => availablePackages.length > 0,
						},
					]);
				}

				if (answer.includes("darklua")) {
					await queue([
						{
							type: "checkbox",
							name: "darkluaMods",
							message: "What should darklua do?",
							choices: [
								{
									name: "Inject __DEV__ global",
									value: "injectDev",
								},
								{
									name: "Remove unused code (should not affect functionality)",
									value: "removeUnused",
								},
								{
									name: "Setup absolute imports (@packages, @client, @common, @server) (recommended)",
									value: "absoluteImports",
								},
							],
						},
					]);
				}
			},
		},
		{
			question: {
				type: "list",
				name: "ui",
				message: "What UI framework would you like to use?",
				choices: [
					{
						name: "None",
						value: "none",
					},
					{
						name: "Fusion",
						value: "fusion",
					},
					{
						name: "React Lua",
						value: "react",
					},
					{
						name: "Vide",
						value: "vide",
					},
				],
				when: () =>
					answers.tools.find((tool: string) => tool === "wally") &&
					answers.darkluaMods?.includes("absoluteImports"),
			},
			completed: async (answer) => {
				if (answer == "none" || answer == undefined) return;

				await queue([
					{
						type: "list",
						name: "storybookPlugin",
						message: "What storybook plugin would you like to use?",
						choices: [
							{
								name: "None",
								value: "none",
							},
							{
								name: "Hoarcekat",
								value: "hoarcekat",
							},
							{
								name: "Flipbook",
								value: "flipbook",
							},
							{
								name: "UI Labs",
								value: "uiLabs",
							},
						],
					},
				]);
			},
		},
		{
			question: {
				type: "confirm",
				name: "git",
				message:
					"Would you like to initialize a git repository? (assumes you have Git installed)",
			},
			completed: async (answer) => {
				if (answer) {
					await queue([
						{
							type: "confirm",
							name: "ci",
							message: "Would you like to setup continuous integration (CI)?",
							when: () =>
								answers.tools.includes("selene") ||
								answers.tools.includes("stylua"),
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
