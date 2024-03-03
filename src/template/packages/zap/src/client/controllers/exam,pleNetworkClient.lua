local network = require("@zap/client")
network.MyEvent.On(function(data)
    print(data)
end)

return nil
