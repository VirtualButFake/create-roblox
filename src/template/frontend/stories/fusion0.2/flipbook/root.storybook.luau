local Storyteller = require("@packages/storyteller")

return {
	name = "Storybook",
	storyRoots = {
		script.Parent.stories,
	},
	packages = {
		Fusion = require("@packages/fusion"),
	},
} :: Storyteller.Storybook
