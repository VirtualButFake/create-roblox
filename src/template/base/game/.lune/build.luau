local process = require("@lune/process")
local fs = require("@lune/fs")

local logger = require("./lib/logger").new(4)

local didError = false

function executeCommand(command, args, options)
	local data = process.spawn(command, args, options or {
		stdio = "default",
	})

	if data.stderr ~= "" then
		didError = true
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

			local content = fs.readFile(path):gsub("__DEV__", "false")
			fs.writeFile(`{dest}/{file}`, content)
		elseif meta.kind == "dir" then
			recursiveCopy(path, `{dest}/{file}`)
		end
	end
end

if fs.isDir(".zap") then
	executeCommand("zap", { "src/server/network.zap" })
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
if fs.isDir("dist/client/ui/stories") then
	fs.removeDir("dist/client/ui/stories")
end

if not didError then
	executeCommand("rojo", { "build", `{buildPath}.project.json`, "-o", "build.rbxl" })
	logger:success("Build complete!")
else
	logger:error("Build failed due to errors.")
end
