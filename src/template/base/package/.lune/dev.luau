--[[local process = require("@lune/process")
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

if fs.isDir(".zap") then 
    executeCommand("zap", {"src/server/network.zap"})
end

task.spawn(executeCommand, "rojo", { "sourcemap", "./sourcemap.project.json", "-o", "sourcemap.json", "--watch" })
task.wait(0.5) -- allow the sourcemap to be generated (prevents an annoying error)

if fs.isFile(".darklua.json") then
	process.env.RBLX_DEV = "true"
	task.spawn(executeCommand, "darklua", { "process", "src", "build", "--watch" })
    task.wait(0.5) -- allow darklua to generate a build, so that rojo doesn't refer to unknown paths and error
end

task.spawn(executeCommand, "rojo", { "serve", fs.isFile("dev.project.json") and "dev.project.json" or "sourcemap.project.json" })
]]

local process = require("@lune/process")
local fs = require("@lune/fs")
local task = require("@lune/task")

local logger = require("./lib/logger").new(5)
local fileWatcher = require("./lib/fileWatcher")

function executeCommand(command, args, options)
	local data = process.spawn(command, args, options or {
		stdio = "default",
	})

	if data.stderr ~= "" then
		logger:error(`Error occurred when running \"{command}\" (code {data.code}): \n{data.stderr}`)
	end

	return data
end

local function recursiveCopy(src, dest)
	local files = fs.readDir(src)

	for _, file in ipairs(files) do
		local path = src .. "/" .. file
		local meta = fs.metadata(path)

		if meta.kind == "file" then
            fs.writeDir(dest)
			fs.writeFile(`{dest}/{file}`, fs.readFile(path))
		elseif meta.kind == "dir" then
			recursiveCopy(path, `{dest}/{file}`)
		end
	end
end

local function processFiles()
	if fs.isFile(".darklua.json") then
		-- clone src as build
		recursiveCopy("src", "build")
		executeCommand("rojo", { "sourcemap", "default.project.json", "-o", "sourcemap.json" })

		process.env.RBLX_DEV = "true"
		executeCommand("darklua", { "process", "src", "build" })
	end
end

processFiles()

logger:success("Watching for file changes..")

task.spawn(fileWatcher, "./src", function(files)
	logger:info(`Detected changes in {#files} file(s)..`)
	processFiles()
end, function(files)
	logger:info(`Detected {#files} deleted files, deleting from build..`)
end)

executeCommand("rojo", { "serve", "dev.project.json" }, {
	stdio = "inherit",
})
