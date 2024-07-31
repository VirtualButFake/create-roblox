-- This is an example story file.
-- Do not use this as a template.
-- Follow examples listed at https://github.com/Kampfkarren/hoarcekat instead for a better implementation specific to your framework.
local React = require("@packages/react")
local ReactRoblox = require("@packages/react-roblox")
local Button = require("@components/button")

return function(parent)
	local root = ReactRoblox.createRoot(Instance.new("Folder"))

	root:render(ReactRoblox.createPortal(
		React.createElement(Button, {
			Text = "Hello, world!",
			Position = UDim2.new(),
			Activated = function()
				print("Hello, world!")
			end,
		}),
		parent
	))

	return function()
		root.unmount()
	end
end
