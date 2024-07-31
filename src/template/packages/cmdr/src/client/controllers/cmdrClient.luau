local ReplicatedStorage = game:GetService("ReplicatedStorage")
local cmdr = require(ReplicatedStorage:WaitForChild("CmdrClient") :: any) -- cmdrclient is parented during runtime by the server, so we can't use types here
cmdr:SetActivationKeys({ Enum.KeyCode.F2 })
cmdr.Registry:RegisterHook("BeforeRun", function()
	return
end)

return nil
