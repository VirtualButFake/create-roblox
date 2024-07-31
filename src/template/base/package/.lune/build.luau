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

	for _, file in ipairs(files) do
		local path = src .. "/" .. file
		local meta = fs.metadata(path)

		if meta.kind == "file" then
			fs.writeDir(dest)

            local content = fs.readFile(path):gsub("__DEV__", "false")
			fs.writeFile(`{dest}/{file}`, content)
		elseif meta.kind == "dir" then
			recursiveCopy(path, `{dest}/{file}`)
		end
	end
end

if not fs.isDir("packages") and not fs.isDir("Packages") and fs.isFile("wally.toml") then
	executeCommand("lune", { "run", "install-packages" })
end

local hasDarkLua = fs.isFile(".darklua.json")
local buildPath = hasDarkLua and "build" or "default"

recursiveCopy("src", "dist")
executeCommand("rojo", { "sourcemap", "default.project.json", "-o", "sourcemap.json" })

if hasDarkLua then
	process.env.RBLX_DEV = "this value should be taken out of the code"
	executeCommand("darklua", { "process", "src", "dist" })
end

-- get rid of stories; no need for those to be in the actual build
if fs.isDir("dist/ui/stories") then
	fs.removeDir("dist/ui/stories")
end

if not didError then
	executeCommand("rojo", { "build", `{buildPath}.project.json`, "-o", "build.rbxm" })
	logger:success("Build complete!")
else 
    logger:error("Build failed due to errors.")
end
