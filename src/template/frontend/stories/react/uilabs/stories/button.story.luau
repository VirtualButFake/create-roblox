-- This is an example story file.
-- Do not use this as a template.
-- Follow https://pepeeltoro41.github.io/ui-labs/ instead for a better implementation specific to your framework.
local React = require("@packages/react")
local ReactRoblox = require("@packages/react-roblox")
local Button = require("@components/button")

return {
	summary = "Button component",
	react = React,
	reactRoblox = ReactRoblox,
	story = function()
		return React.createElement(Button, {
			Text = "Click me!",
			Position = UDim2.new(),
			Activated = function()
				print("Button clicked!")
			end,
		})
	end,
}
