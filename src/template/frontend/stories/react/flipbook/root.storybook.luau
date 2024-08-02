local React = require("@packages/react")

return {
	name = "Storybook",
	react = React,
	storyRoots = {
		script.Parent.stories,
	},
}
