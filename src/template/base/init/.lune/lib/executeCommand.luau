local process = require("@lune/process")

local logger = require("./lib/logger").new(4)

return function(command, args, options)
	local data = process.spawn(command, args, options or {
		stdio = "default",
	})

	if data.stderr ~= "" then
		logger:error(`Error occurred when running \"{command}\" (code {data.code}): \n{data.stderr}`)
	end

	return data
end