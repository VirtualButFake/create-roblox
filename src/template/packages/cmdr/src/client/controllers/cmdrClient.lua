local ReplicatedStorage = game:GetService("ReplicatedStorage")
local cmdr = require(ReplicatedStorage:WaitForChild("CmdrClient"))
cmdr:SetActivationKeys({ Enum.KeyCode.F2 })
cmdr.Registry:RegisterHook("BeforeRun", function()
	return
end)

return nil
