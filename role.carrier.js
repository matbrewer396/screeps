var params = require('params');
const LogLevel = params.LogLevel;
const Tasks = params.CreepTasks;
var roleCarrier = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.store[RESOURCE_ENERGY] == 0 || (creep.getTask() == Tasks.FIND_ENERGY) ) {
            creep.setTask(Tasks.FIND_ENERGY);
            creep.collectEnergy(true);
            return;
        };

        if (!creep.dropOffEnergy()){
            if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                creep.setTask(Tasks.FIND_ENERGY);
                creep.collectEnergy(true);
                return;
            }
            creep.log("nothing todo",LogLevel.INFO);
        }

    }
};


module.exports = roleCarrier;