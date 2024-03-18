local process = require("@lune/process")
local fs = require("@lune/fs")
local task = require("@lune/task")

function executeCommand(command, args)
	local data = process.spawn(command, args, {
		stdio = "inherit",
	})

	if data.code ~= 0 then
		error("Command failed with code " .. data.code)
	end

	return data
end

if fs.isDir("packages") then
	fs.removeDir("packages")
end

executeCommand("wally", {
	"install",
})

if not fs.isDir("packages") then 
    fs.writeDir("packages")
end

-- do this so the project file doesn't refer to files that don't exist and cause rojo to fail
if fs.isDir(".zap") then
	executeCommand("zap", { "src/server/network.zap" })
end

executeCommand("rojo", {
	"sourcemap",
	fs.isFile("sourcemap.project.json") and "sourcemap.project.json" or "default.project.json",
	"-o",
	"sourcemap.json",
})

if fs.isDir("Packages") then
	executeCommand("wally-package-types", {
		"--sourcemap",
		"sourcemap.json",
		"./Packages",
	})

	-- doing this instead of placing it inside 1 file since this method ties into the existing template concept better
	if fs.isFile("scripts/install-packages/lowercase.lua") then
		task.wait(0.5) -- sometimes os doesn't release the file fast enough
		require("./lowercase")()
	end
end