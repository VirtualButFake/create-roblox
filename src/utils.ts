import { SpawnSyncOptions, spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import logger from "./logger.js";
import path from "path";
import { ProjectSettings } from "./cli.js";

async function merge(target: any, source: any): Promise<any> {
	const isObject = (obj: any) => obj && typeof obj === "object";

	if (!isObject(target) || !isObject(source)) {
		return source;
	}

	await Promise.all(
		Object.keys(source).map(async (key) => {
			const targetValue = target[key];
			const sourceValue = source[key];

			if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
				target[key] = targetValue.concat(sourceValue);
			} else if (isObject(targetValue) && isObject(sourceValue)) {
				target[key] = await merge(Object.assign({}, targetValue), sourceValue);
			} else {
				target[key] = sourceValue;
			}
		})
	);

	return target;
}

const templateData: {
	absolutePaths: { [key: string]: string };
	packages: string[];
	tools: { [key: string]: string };
} = {
	absolutePaths: {},
	packages: [],
	tools: {},
};

const handledConfigFiles: string[] = [];

async function applyTemplateConfig(filePath: string, fileBase: string) {
	if (handledConfigFiles.includes(filePath)) return;

	if (filePath.endsWith(".json")) {
		const json = JSON.parse(fs.readFileSync(filePath, "utf-8"));
		await merge(templateData, json);
		return;
	}

	if (filePath.endsWith(".ts")) {
		fileBase = fileBase.substring(0, fileBase.length - 3); // really ugly code below; needed to get import statement to work
		if (fileBase.startsWith("./template")) {
			fileBase = fileBase.split("/").slice(1).join("/");
		}

		const script: {
			default: {
				absolutePaths?: (settings: ProjectSettings) => Promise<{
					[key: string]: string;
				}>;
				packages?: (settings: ProjectSettings) => Promise<string[]>;
				tools?: (
					settings: ProjectSettings
				) => Promise<{ [key: string]: string }>;
			};
		} = await import(`./template/${fileBase}.ts`);

		for (const [k, value] of Object.entries(script.default)) {
			const key = k as keyof typeof script.default;

			if (templateData[key]) {
				templateData[key] = await merge(
					templateData[key],
					await value(globalThis.settings)
				);
			}
		}
	}

	if (filePath.endsWith(".md")) {
		const md = fs.readFileSync(filePath, "utf-8");
		fs.writeFileSync(
			"./temp/README.md",
			fs.readFileSync("./temp/README.md", "utf-8") + "\n\n" + md
		);
	}

	handledConfigFiles.push(filePath);
}

export async function writeToFolder(
	folder: string,
	source: string,
	overwrite: boolean
) {
	const files = await fs.promises.readdir(source);

	for (const file of files) {
		const folderPath = path.join(folder, file);
		const sourcePath = path.join(source, file);

		if (file.startsWith(".template")) {
			await applyTemplateConfig(sourcePath, file);
			continue;
		}

		const sourceStats = await fs.promises.lstat(sourcePath);

		if (sourceStats.isDirectory()) {
			if (!fs.existsSync(folderPath)) {
				await fs.promises.mkdir(folderPath);
			}

			await writeToFolder(folderPath, sourcePath, overwrite);
		} else {
			if (!fs.existsSync(folderPath)) {
				await fs.promises.copyFile(sourcePath, folderPath);
			} else if (overwrite) {
				if (path.extname(sourcePath) === ".json") {
					const sourceJson = JSON.parse(
						await fs.promises.readFile(sourcePath, "utf-8")
					);
					const folderJson = JSON.parse(
						await fs.promises.readFile(folderPath, "utf-8")
					);
					const merged = JSON.stringify(
						await merge(folderJson, sourceJson),
						null,
						4
					);

					await fs.promises.writeFile(folderPath, merged);
					continue;
				}

				await fs.promises.rm(folderPath);
				await fs.promises.copyFile(sourcePath, folderPath);
			}
		}
	}
}

export async function writeTemplate(
	template: string[],
	location: string = "./temp"
) {
	let templateLocation = "";

	for (const part of template) {
		const fileBase = `${templateLocation}${part}/.template`;

		if (part != template[template.length - 1]) {
			if (fs.existsSync(`./src/template/${fileBase}.json`)) {
				await applyTemplateConfig(
					`./src/template/${fileBase}.json`,
					`${fileBase}.json`
				);
			}

			if (fs.existsSync(`./src/template/${fileBase}.ts`)) {
				await applyTemplateConfig(
					`./src/template/${fileBase}.ts`,
					`${fileBase}.ts`
				);
			}

			if (fs.existsSync(`./src/template/${fileBase}.md`)) {
				await applyTemplateConfig(
					`./src/template/${fileBase}.md`,
					`${fileBase}.md`
				);
			}
		}

		templateLocation += `${part}/`;
	}

	templateLocation = `./src/template/${templateLocation}`; // doing this so dynamic imports resolve properly; using ../template in the import statement will include the template folder in the build

	if (!fs.existsSync(templateLocation)) {
		throw new Error(`Template ${template.join("/")} does not exist`);
	}

	logger.debug(`Loading template ${template.join("/")} into temp..`);

	if (!fs.existsSync(location)) {
		fs.mkdirSync(location, { recursive: true });
	}

	await writeToFolder(location, templateLocation, true);
	return true;
}

export function getTemplateData() {
	return templateData;
}

export async function executeCommand(
	command: string,
	args: string[],
	options: SpawnSyncOptions = {}
) {
	const response = spawnSync(command, args, options);

	if (response.error) {
		throw response.error;
	}

	return response;
}

// from Moonwave
function getBinaryExtension(): string {
	if (os.platform() === "win32") {
		return ".exe";
	}

	return "";
}

async function getPattern(
	folderName: string,
	patternOverwrites?: {
		win32?: string;
		darwin?: string;
		linux?: string;
	}
): Promise<string | undefined> {
	switch (os.platform()) {
		case "win32":
			return (
				patternOverwrites?.win32 || `^${folderName}(?:-|-.*-)windows-x86_64$`
			);
		case "darwin":
			return (
				patternOverwrites?.darwin || `^${folderName}(?:-|-.*-)macos-x86_64$`
			);
		case "linux":
			return (
				patternOverwrites?.linux || `^${folderName}(?:-|-.*-)linux-x86_64$`
			);
		default:
			return undefined;
	}
}

export async function runBinary(
	folderName: string,
	binaryName: string,
	args: string[],
	options: SpawnSyncOptions,
	patternOverwrites?: {
		win32?: string;
		darwin?: string;
		linux?: string;
	}
) {
	const pattern = await getPattern(folderName, patternOverwrites);

	if (!pattern) {
		logger.error(
			`Could not find a ${binaryName} pattern for the current platform`
		);

		return;
	}

	const fileName = fs
		.readdirSync("./bin")
		.find((file) => file.match(new RegExp(pattern)));
	const fullFilePath = `./bin/${fileName}/${binaryName}${getBinaryExtension()}`;

	if (!fs.existsSync(fullFilePath)) {
		logger.error(
			`Could not find a ${binaryName} binary for the current platform`
		);
		return;
	}

	logger.debug(`Running ${binaryName} binary..`);
	return executeCommand(path.resolve(fullFilePath), args, options);
}

export function getPackagePath(settings: ProjectSettings) {
	const packagePath = settings.wallyMods?.find(
		(mod: string) => mod === "lowercaseNames"
	)
		? "packages"
		: "Packages";

	return packagePath;
}
