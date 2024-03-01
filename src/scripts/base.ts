import { ProjectSettings } from "../cli.js";
import {
	writeTemplate,
	getPackagePath
} from "../utils.js";
import fs from "fs";

export default async function (settings: ProjectSettings) {
	await writeTemplate(["base", "init"]);
	await writeTemplate(["base", settings.projectType]);

	fs.writeFileSync(
		"./temp/build.project.json",
		fs
			.readFileSync("./temp/build.project.json", "utf-8")
			.replace("{{ project_name }}", settings.projectName)
			.replace("{{ package_path }}", getPackagePath(settings))
	);
	fs.writeFileSync(
		"./temp/default.project.json",
		fs
			.readFileSync("./temp/default.project.json", "utf-8")
			.replace("{{ project_name }}", settings.projectName)
			.replace("{{ package_path }}", getPackagePath(settings))
	);

	fs.writeFileSync(
		"README.md",
		fs
			.readFileSync("README.md", "utf-8")
			.replace("{{ project_name }}", settings.projectName)
	);

	if (!settings.tools.find((tool) => tool === "darklua")) {
		fs.unlinkSync("./temp/build.project.json");
	}
}
