function init()
    hcreate('fingerHex');
    hset('fingerHex', 'key', 'finger')
end

function register_finger_hex(hexCode)
    local account = tostring(exec_account())
    hset('fingerHex', account, tostring(hexCode))
end
