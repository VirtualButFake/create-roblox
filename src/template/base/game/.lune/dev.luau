local process = require("@lune/process")
local fs = require("@lune/fs")
local task = require("@lune/task")

local logger = require("./lib/logger").new(4)
local fileWatcher = require("./lib/fileWatcher")
local executeCommand = require("./lib/executeCommand")

local function recursiveCopy(src, dest)
	local files = fs.readDir(src)

	for _, file in files do
		local path = src .. "/" .. file

		if fs.isFile(path) then
			fs.writeDir(dest)
			fs.writeFile(`{dest}/{file}`, fs.readFile(path))
		elseif fs.isDir(path) then
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
		recursiveCopy("src", "temp")
		executeCommand("rojo", { "sourcemap", "default.project.json", "-o", "sourcemap.json" })

		process.env.RBLX_DEV = "true"
		local status = executeCommand("darklua", { "process", "src", "temp" })

        if status.code == 0 then
			recursiveCopy("temp", "dist")
        else 
            logger:error("Did not update files due to Darklua error, check console for more information.")
		end

        fs.removeDir("temp")
	end
end

processFiles()

logger:success("Watching for file changes..")

task.spawn(fileWatcher, "./src", function(files)
	logger:info(`Detected changes in {#files} file(s)..`)
	processFiles()
end, function(files)
    for _, file in files do
        logger:info(`{file} deleted, removing from build..`)

        if file:sub(1, 6) == "./src/" then
            file = file:sub(7)
        end

        if fs.isFile(`dist/{file}`) then
            fs.removeFile(`dist/{file}`)
        elseif fs.isDir(`dist/{file}`) then
            fs.removeDir(`dist/{file}`)
        end
    end
end)

executeCommand("rojo", { "serve", `{buildPath}.project.json` }, {
	stdio = "inherit",
})
