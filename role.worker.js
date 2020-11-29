var roleWorker = {
    run: function (creep) {
        /* Check for energy
        */
        if (creep.store[RESOURCE_ENERGY] == 0 || (creep.getTask() == CreepTasks.FIND_ENERGY)) {
            creep.setTask(CreepTasks.FIND_ENERGY);
            creep.collectEnergy(true);
            creep.memory.workerTarget = null;
            return;
        }

        /* Find somethign 
        */
        var workerTarget = Game.getObjectById(creep.memory.workerTarget);

        if (!workerTarget || !creep.getTask()) {
            if (creep.room.energyAvailable !== creep.room.energyCapacityAvailable
                && (creep.room.creepsInRole(Role.CARRIER) == 0 || creep.room.creepsInRole(Role.MINER) == 0)) {
                creep.log("Room not at max energyCapacityAvailable and no minder or carriers ", LogLevel.DEBUG);

                if (creep.dropOffEnergy()) {
                    return;
                }
            }
            workerTarget = assignWork(creep);
        };
        /* Carrier mood
        */
        if (creep.room.energyAvailable !== creep.room.energyCapacityAvailable
            && creep.room.creepsInRole(Role.CARRIER) < creep.room.noOfSources) {
            creep.log("Room not at max energyCapacityAvailable and not enough CARRIERs", LogLevel.DEBUG);
            if (creep.dropOffEnergy()) {
                return;
            }

        }

        /* This else to do
        */
        if (!workerTarget 
            && creep.room.isHealthy() 
            && creep.room.heathyStorageReserve()
        ) {
            if (creep.room.findUpgradeControllerWithSpace().length > 0) {
                creep.memory.workerTarget = creep.room.findUpgradeControllerWithSpace()[0];
                creep.dropOffEnergy();
            } else {
                creep.upgradeRoomController();
            }
            return;
        }


        // become carrier
        if (!workerTarget || creep.getTask() == CreepTasks.DROPOFF_ENERGY) {
            if (creep.dropOffEnergy()) return;
        }


        if (!workerTarget) {
            creep.log("Nothing todo", LogLevel.ALWAYS);
            return
        }

        creep.log("Working on " + workerTarget.structureType, LogLevel.DEBUG);

        if (creep.getTask() == CreepTasks.BUILD) {
            creep.log("Building", LogLevel.DEBUG);
            creep.buildIt(workerTarget);
        } else if (creep.getTask() == CreepTasks.UPGRADE_CONTROLLER 
          //&& creep.room.storage.store[RESOURCE_ENERGY] > 20000
        ) {
            if (creep.room.findUpgradeControllerWithSpace().length > 0) {
                creep.memory.workerTarget = creep.room.findUpgradeControllerWithSpace()[0];
                creep.dropOffEnergy();
            } else {
                creep.upgradeRoomController();
            }
            
        } else if (creep.getTask() == CreepTasks.REPAIRER) {
            creep.log("repair. getRepairUpTo:" 
                + workerTarget.getRepairUpTo() 
                + "; getHealthPercentage:" 
                + workerTarget.getHealthPercentage(), LogLevel.DEBUG);
            if (workerTarget.getRepairUpTo() <= workerTarget.getHealthPercentage()){
                //creep.log(workerTarget.hits + ' - ' + workerTarget.hitsMax + ' - ' + workerTarget.hitsMax * creep.getRoleConfig().repairStructuresAtHealthPercentage / 100, LogLevel.DEBUG);
                creep.taskCompleted();
                workerTarget = null;
                
            }
            
            if (creep.repair(workerTarget) == ERR_NOT_IN_RANGE) {
                creep.moveTo(workerTarget, { visualizePathStyle: { stroke: '#ffffff' } });
            };
        } else {
            creep.log("task not handled", LogLevel.ERROR);
            creep.taskCompleted();
        }


    },
    spawnData: function (room) {
        let name = getNewCreepName("WORKER");
        let body = [];
        let memory = {
            role: Role.WORKER,
            myRoom: room.name
        };

        body = fnBuildBody(body, [CARRY, MOVE, WORK], room.energyAvailable)
        room.log("Spwaming new workder - " + name + ' body: ' + body.toString(), LogLevel.DEBUG);
        return { name, body, memory };

    },noRequiredCreep: function(room) {
        if (room.controller.level == 1) {
            return 4
        } else if (room.controller.level ==  2) {
            return 6
        } else if (room.controller.level ==  3) {
            return 4
        } else {
            return 2
        }

        
    }

}

function assignWork(creep) {
    creep.log("No work", LogLevel.DEBUG)
    /**
     *  Repair Neext builing
     */
    var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => s.getHealthPercentage() < s.getRepairAt().Creep
    });

    if (target !== null) {
        creep.log("Repairing:" + target + '; Hits ' + target.hits + '; Max Hits ' + target.hitsMax, LogLevel.INFO)
        creep.memory.workerTarget = target.id;
        creep.setTask(CreepTasks.REPAIRER)
        return target;
    } else {
        creep.memory.repairer = false;
    };

    /* builder
    */
    target = creep.room.find(FIND_CONSTRUCTION_SITES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN)
        }
    }).sort(function(a, b){return b.progress-a.progress})[0];

    if (!target) {
        target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
    };

    if (!target) {
        creep.log("No work found", LogLevel.DEBUG);
    } else {
        creep.log("Worker target found" + target, LogLevel.DEBUG);
        creep.memory.workerTarget = target.id;
        creep.setTask(CreepTasks.BUILD)
        return target;

    }
};

module.exports = roleWorker;