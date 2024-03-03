local Players = game:GetService("Players")

local network = require("@zap/server")

Players.PlayerAdded:Connect(function(plr)
    task.wait(1)
    network.MyEvent:Fire(plr, {
        foo = "test",
        bar = 5
    })
end)

return nil