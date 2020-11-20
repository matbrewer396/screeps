var params = require('params');
const LogLevel = params.LogLevel;
const Tasks = params.CreepTasks;
var roleWorker = {
    run: function(creep) {
        /* Check for energy
        */
        if (creep.store[RESOURCE_ENERGY] == 0 || (creep.getTask() == Tasks.FIND_ENERGY) ) {
            creep.setTask(Tasks.FIND_ENERGY);
            creep.collectEnergy(true);
            return;
        }

        /* Find somethign 
        */
        var workerTarget = Game.getObjectById(creep.memory.workerTarget);

        if (!workerTarget || !creep.getTask()) {
            workerTarget = assignWork(creep);
        };
        /* Carrier mood
        */
       if (creep.room.energyAvailable  !== creep.room.energyCapacityAvailable && creep.room.noOfCarrier < creep.room.noOfSources) {
            creep.log("Room not at max call ", LogLevel.DEBUG);
           if (creep.dropOffEnergy()){
               return;
           }
        
       }

        /* This else to do
        */
        if (!workerTarget ) {
            creep.upgradeRoomController();
            return;
        }

        creep.log("Working on" + workerTarget.structureType, LogLevel.DEBUG);

        if (creep.getTask() == Tasks.BUILD) {
            creep.buildIt(workerTarget);
        } else if (creep.getTask() == Tasks.UPGRADE_CONTROLLER) {
            creep.upgradeRoomController();
        } else if (creep.getTask() == Tasks.REPAIRER) {
            if (workerTarget.hitsMax ==  workerTarget.hits){
                creep.taskCompleted();
            }
            creep.log(workerTarget.hits + ' - ' + workerTarget.hitsMax + ' - ' + workerTarget.hitsMax * creep.getRole().repairStructuresAtHealthPercentage/100 , LogLevel.ALWAYS);
            if (creep.repair(workerTarget) == ERR_NOT_IN_RANGE) {
                creep.moveTo(workerTarget, {visualizePathStyle: {stroke: '#ffffff'}});
            };
        } else {
            creep.taskCompleted();
        }


    }

}

function assignWork(creep) {
    creep.log("No work", LogLevel.DEBUG) 
    var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => s.hits < (s.hitsMax * creep.getRole().repairStructuresAtHealthPercentage/100) && s.structureType != STRUCTURE_WALL
    });
    

    if (target !== null) {
        creep.log("Repairing:" + target + '; Hits ' + target.hits+ '; Max Hits ' + target.hitsMax , LogLevel.INFO) 
        creep.memory.workerTarget = target.id;
        creep.setTask(Tasks.REPAIRER)
        return target;
    } else {
        creep.memory.repairer = false;
    };


    target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
        filter: (structure) => { 
            return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) }
    });

    if(!target) { 
        target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
    };

    if(!target) { 
        creep.log("No work found", LogLevel.DEBUG);
    } else {
        creep.log("Worker target found" + target, LogLevel.DEBUG);
        creep.memory.workerTarget = target.id;
        creep.setTask(Tasks.BUILD)
        return target;

    }

    
}
module.exports = roleWorker;