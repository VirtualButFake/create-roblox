opt server_output = "../../.zap/server.lua"
opt client_output = "../../.zap/client.lua"

event MyEvent = {
    from: Server,
    type: Reliable,
    call: ManyAsync,
    data: struct {
        foo: string,
        bar: u8,
    },
}