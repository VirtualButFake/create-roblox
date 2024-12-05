-- This is an example story file, not meant for a specific UI framework.
-- Do not use this as a template.
-- Follow https://flipbook-labs.github.io/flipbook/docs/writing-stories instead for an implementation specific to your framework.
local Button = require("@components/button")

local Storyteller = require("@packages/storyteller")
local fusion = require("@packages/fusion")

local story: Storyteller.Story<any> = {
	summary = "Button component",
	story = function(parent)
		local scope = fusion.scoped(fusion)

		Button(scope, {
			Text = "Click me!",
			Position = UDim2.new(),
			Parent = parent,
			Activated = function()
				print("Button clicked!")
			end,
		})

		return function()
			fusion.doCleanup(scope)
		end
	end,
}

return story
