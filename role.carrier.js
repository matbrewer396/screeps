var roleCarrier = {

    /** @param {Creep} creep **/
    run: function(creep) {

        //if (creep.room.heathyStorageReserve() )

        // if (creep.name == "CARRIER_7319") {
        //     creep.setTask(CreepTasks.FIND_ENERGY);
        //     creep.collectResource(true);
        //     return;
        // }

        if (creep.store[RESOURCE_ENERGY] == 0 || (creep.getTask() == CreepTasks.FIND_ENERGY) ) {
            creep.setTask(CreepTasks.FIND_ENERGY);
            creep.collectResource(true);
            return;
        };

        if (!creep.dropOffEnergy()){
            if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > creep.store.getCapacity(RESOURCE_ENERGY) * 10 ) {
                creep.setTask(CreepTasks.FIND_ENERGY);
                creep.collectResource(true);
                return;
            }
            // tod get from sour e
            
            creep.log("nothing todo",LogLevel.INFO);
        }

    },

    spawnData: function(room) {
        let name = getNewCreepName("CARRIER");
        let body = [];
        let memory = {
            role: Role.CARRIER,
            myRoom: room.name
        };
    
        body = fnBuildBody(body, [CARRY,MOVE,CARRY],room.energyAvailable)
        room.log("Spawning new  - " + name + ' body: ' + body.toString(),LogLevel.DEBUG);
        return {name, body, memory};
    
    }, noRequiredCreep: function(room) {
        if (room.creepsInRole(Role.MINER) > 1 ) {
            return 2
        } else {
            return 0
        }
        
    }


};


module.exports = roleCarrier;
const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'roleCarrier');
