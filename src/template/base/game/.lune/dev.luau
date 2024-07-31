local process = require("@lune/process")
local fs = require("@lune/fs")
local task = require("@lune/task")

local logger = require("./lib/logger").new(4)
local fileWatcher = require("./lib/fileWatcher")
local executeCommand = require("./lib/executeCommand")

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

local hasDarkLua = fs.isFile(".darklua.json")
local buildPath = hasDarkLua and "build" or "default"

local function processFiles()
	if fs.isDir(".zap") then
		executeCommand("zap", { "src/server/network.zap" })
	end

	if fs.isFile(".darklua.json") then
		-- clone src as build
		recursiveCopy("src", "build")
		executeCommand("rojo", { "sourcemap", `{buildPath}.project.json`, "-o", "sourcemap.json" })

		process.env.RBLX_DEV = "true"
		executeCommand("darklua", { "process", "build", "build" })
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

executeCommand("rojo", { "serve", `{buildPath}.project.json` }, {
	stdio = "inherit",
})
