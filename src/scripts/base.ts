import { ProjectSettings } from "../cli.js";
import { writeTemplate, getPackagePath } from "../utils.js";
import fs from "fs";

export default async function (settings: ProjectSettings) {
	await writeTemplate(["base", "init"]);
	await writeTemplate(["base", settings.projectType]);

    for (const file of fs.readdirSync("./temp")) {
        if (file.endsWith(".project.json")) {
            fs.writeFileSync(
                `./temp/${file}`,
                fs
                    .readFileSync(`./temp/${file}`, "utf-8")
                    .replaceAll("{{ project_name }}", settings.projectName)
                    .replaceAll("{{ package_path }}", getPackagePath(settings))
            );
        
        }
    }

	fs.writeFileSync(
		"./temp/README.md",
		fs
			.readFileSync("./temp/README.md", "utf-8")
			.replaceAll("{{ project_name }}", settings.projectName)
	);

    if (!settings.tools.find((tool) => tool === "darklua") && settings.projectType == "package") {
        // replace "build" with "src" in dev.project.json and default.project.json
        for (const file of ["dev.project.json", "default.project.json"]) {
            fs.writeFileSync(
                `./temp/${file}`,
                fs
                    .readFileSync(`./temp/${file}`, "utf-8")
                    .replaceAll("\"$path\": \"build\"", "\"$path\": \"src\"")
            );
        }
    }
}
