-- This TextButton component is not following best practices; do not use it as reference.
-- It was purely meant to work well with the example stories.
local React = require("@packages/react")

local e = React.createElement

export type props = React.ElementProps<TextButton>

local function Button(props: props)
	return e("TextButton", {
		BackgroundColor3 = Color3.fromRGB(50, 50, 50),
		TextColor3 = Color3.fromRGB(255, 255, 255),
		Size = UDim2.fromOffset(200, 150),
		Position = props.Position,
		Text = props.Text,
		Parent = props.Parent,
		[React.Event.Activated] = props.Activated,
	}, props.children)
end

return Button
