
global.LogLevel = {ERROR: -2, ALWAYS: -1, NOTHING: 0,INFO: 1, DEBUG: 2, DETAILED: 3}
global.Role = {WORKER: 'worker', MINER: 'miner', CARRIER: "carrier", UPGRADER: "upgrader"};

global.CreepTasks = {
    //
    FIND_SOURCE: "FIND_SOURCE",
    FIND_ENERGY: "FIND_ENERGY",
    DROPOFF_ENERGY: "DROPOFF_ENERGY",

    //Worker Job 
    BUILD: "BUILD",
    UPGRADE_CONTROLLER: "UPGRADE_CONTROLLER",
    REPAIRER: "REPAIRER",

    // Renewing
    RENEWING: "RENEWING",
    RENEWING_MOVING_TO_SPAWN:"RENEWING_MOVING_TO_SPAWN",
    RECYCLING:"RECYCLING"

}


global.BODYPART_COST = { "move": 50, "work": 100, "attack": 80, "carry": 50, "heal": 250, "ranged_attack": 150, "tough": 10, "claim": 600 };

global.CreepBody = [
    {"Part": "work","Cost": 100 },
    {"Part": "move","Cost": 50 },
    {"Part": "carry","Cost": 50 },
]

global.RoomStage = {
    CAMP: 0,
    OUTPOST: 10,
    SETTLEMENT: 20,
    VILLAGE: 30,
    TOWN: 40,
    CITY: 50,
}
