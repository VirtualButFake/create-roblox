local vide = require("@packages/vide")

local create = vide.create

local function Button(props: {
	Position: UDim2,
	Text: string,
	Parent: Instance?,
	Activated: () -> (),
})
	return create("TextButton")({
		BackgroundColor3 = Color3.fromRGB(50, 50, 50),
		TextColor3 = Color3.fromRGB(255, 255, 255),
		Size = UDim2.fromOffset(200, 150),

		Position = props.Position,
		Text = props.Text,
		Parent = props.Parent,
		Activated = props.Activated,

		create("UICorner")({}),
	})
end

return Button
