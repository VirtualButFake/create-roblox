local logger = {}

local terminal = require("./terminal")
local chalk = require("./chalk")

local function wrapWithBrackets(text: string): string
	return string.format(`{chalk.dim("[")}%s{chalk.dim("]")}`, text)
end

local logger_templates = {
	info = wrapWithBrackets(chalk.blue("INFO")),
	warn = wrapWithBrackets(chalk.yellow("WARN")),
	error = wrapWithBrackets(chalk.red("ERROR")),
	success = wrapWithBrackets(chalk.green("SUCCESS")),
	debug = wrapWithBrackets(chalk.magenta("DEBUG")),
}

-- Types
export type logger = typeof(setmetatable(
	{} :: {
		logLevel: number,
	},
	{ __index = logger }
))

function logger.new(logLevel: number): logger
	return setmetatable({
		logLevel = logLevel,
	}, { __index = logger })
end

function logger:error(message: string, ...: string)
	local formattedMessage = string.format(message, ...)

	if self.logLevel >= 1 then
		terminal.write(`{logger_templates.error} {chalk.white(formattedMessage)}`)
	end
end

function logger:warn(message: string, ...: string)
	local formattedMessage = string.format(message, ...)

	if self.logLevel >= 2 then
		terminal.write(`{logger_templates.warn} {chalk.white(formattedMessage)}`)
	end
end

function logger:info(message: string, ...: string)
	local formattedMessage = string.format(message, ...)

	if self.logLevel >= 3 then
		terminal.write(`{logger_templates.info} {chalk.white(formattedMessage)}`)
	end
end

function logger:success(message: string, ...: string)
	local formattedMessage = string.format(message, ...)

	if self.logLevel >= 3 then
		terminal.write(`{logger_templates.success} {chalk.white(formattedMessage)}`)
	end
end

function logger:debug(message: string, ...: string)
	local formattedMessage = string.format(message, ...)

	if self.logLevel >= 4 then
		terminal.write(`{logger_templates.debug} {chalk.white(formattedMessage)}`)
	end
end

return logger
