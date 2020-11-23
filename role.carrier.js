var roleCarrier = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.store[RESOURCE_ENERGY] == 0 || (creep.getTask() == CreepTasks.FIND_ENERGY) ) {
            creep.setTask(CreepTasks.FIND_ENERGY);
            creep.collectEnergy(true);
            return;
        };

        if (!creep.dropOffEnergy()){
            if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                creep.setTask(CreepTasks.FIND_ENERGY);
                creep.collectEnergy(true);
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
    
        body = fnBuildBody(body, [CARRY,MOVE],room.energyAvailable)
        room.log("Spawning new  - " + name + ' body: ' + body.toString(),LogLevel.DEBUG);
        return {name, body, memory};
    
    }


};


module.exports = roleCarrier;