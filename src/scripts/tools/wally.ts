import fs from "fs";
import os from "os";
import { ProjectSettings } from "../../cli.js";
import { executeCommand, getTemplateData, writeTemplate } from "../../utils.js";

export default async function (settings: ProjectSettings) {
	if (!settings.tools.find((tool) => tool === "wally")) return;
	if (!settings.wallyMods) return;

	await writeTemplate(["tools", "wally", "base"]);

	for (const mod of settings.wallyMods) {
		await writeTemplate(["tools", "wally", mod]);
	}

	const wallyPackages = getTemplateData().packages;

	fs.writeFileSync(
		"./temp/wally.toml",
		`[package]\nname = "${os.userInfo().username}/${settings.projectName
			.toLowerCase()
			.replace(
				/[^a-zA-Z0-9]/g,
				""
			)}"\nversion = "0.1.0"\nregistry = "https://github.com/UpliftGames/wally-index"\nrealm = "shared"\n\n[dependencies]\n${wallyPackages.join(
			"\n"
		)}`
	);

	await executeCommand("lune", ["run", "scripts/install-packages"], {
		cwd: "./temp",
		stdio: "inherit",
	});
}
