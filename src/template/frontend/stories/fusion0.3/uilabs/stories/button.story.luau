-- This is an example story file.
-- Do not use this as a template.
-- Follow https://pepeeltoro41.github.io/ui-labs/ instead for a better implementation.
local fusion = require("@packages/fusion")

local Button = require("@components/button")

return {
	fusion = fusion,
	story = function(props)
		local btn = Button(props.scope, {
			Text = "Click me!",
			Position = UDim2.new(),
			Parent = props.target,
			Activated = function()
				print("Button clicked!")
			end,
		})

		return function()
			btn:Destroy()
		end
	end,
}
