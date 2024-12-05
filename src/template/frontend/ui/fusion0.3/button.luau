local fusion = require("@packages/fusion")
local Event = fusion.OnEvent

type props = {
	Position: UDim2,
	Text: string,
	Parent: Instance?,
	Activated: (inputObject: InputObject, clickCount: number) -> nil,
}

local function Button(scope: fusion.Scope<any>, props: props)
	return scope:New("TextButton")({
		BackgroundColor3 = Color3.fromRGB(50, 50, 50),
		TextColor3 = Color3.fromRGB(255, 255, 255),
		Size = UDim2.fromOffset(200, 150),
		Position = props.Position,
		Text = props.Text,
		Parent = props.Parent,
		[Event("Activated")] = props.Activated,
	})
end

return Button
