local process = require("@lune/process")
local fs = require("@lune/fs")

local logger = require("./lib/logger").new(4)
local executeCommand = require("./lib/executeCommand")

local didError = false

local function execCommandWrapper(...)
    local data = executeCommand(...)

    if data.stderr ~= "" then
        didError = true
    end

    return data
end

local function recursiveCopy(src, dest)
	local files = fs.readDir(src)

	for _, file in files do
		local path = src .. "/" .. file
		local meta = fs.metadata(path)

		if meta.kind == "file" then
			fs.writeDir(dest)
			fs.writeFile(`{dest}/{file}`,  fs.readFile(path))
		elseif meta.kind == "dir" then
			recursiveCopy(path, `{dest}/{file}`)
		end
	end
end

if fs.isFile("src/server/network.zap") then
	execCommandWrapper("zap", { "src/server/network.zap" })
end

if not fs.isDir("packages") and not fs.isDir("Packages") and fs.isFile("wally.toml") then
	execCommandWrapper("lune", { "run", "install-packages" })
end

local hasDarkLua = fs.isFile(".darklua.json")

execCommandWrapper("rojo", { "sourcemap", "default.project.json", "-o", "sourcemap.json" })

if hasDarkLua then
	process.env.RBLX_DEV = "this value should be taken out of the code"
	execCommandWrapper("darklua", { "process", "src", "temp" })
else 
    recursiveCopy("src", "temp")
end

-- Optional processing steps here

recursiveCopy("temp", "dist")

-- get rid of stories; no need for those to be in the actual build
if fs.isDir("dist/client/ui/stories") then
	fs.removeDir("dist/client/ui/stories")
end

if not didError then
	execCommandWrapper("rojo", { "build", "build.project.json", "-o", "build.rbxl" })
	logger:success("Build complete!")
else
	logger:error("Build failed due to errors.")
end

fs.removeDir("temp")
