-- Simple did login demo
function init()
    -- hash map
    hcreate('mapproperties')
    hcreate('mapdids')
    -- For test key
    hset('mapdids', 'key', '1234')
    hset('mapproperties', 'key', 'abcdef')
    -- create_key('temp')
end

function register_properties(properties)
    -- profile vc for holder
    -- issued by did contract or other third party organization
    local account = tostring(exec_account())
    hset('mapproperties', account, tostring(properties))
end

function register_did(did)
    -- for holders register did address map
    -- eg. example@topnetwork.org as did
    local account = tostring(exec_account())
    hset('mapdids', tostring(did), account)
end
