-- This is an example story file, not meant for a specific UI framework.
-- Do not use this as a template.
-- Follow https://ui-labs-roblox.github.io/ui-labs-docs/docs/ instead for an implementation specific to your framework.
local Button = require("@components/button")

return function(parent: Frame)
	local btn = Button({
		Text = "Click me!",
		Position = UDim2.new(),
		Parent = parent,
		Activated = function()
			print("Button clicked!")
		end,
	})

	return function()
		btn:Destroy()
	end
end
