-- This is an example story file, not meant for a specific UI framework.
-- Do not use this as a template.
-- Follow examples listed at https://github.com/Kampfkarren/hoarcekat instead for an implementation specific to your framework.
local Button = require("@components/button")

return function(parent)
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
