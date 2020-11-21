// var roleHarvester = require('role.harvester');

// var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');
var roleMiner = require('role.miner');
var roleWorker = require('role.worker');
var roleCarrier = require('role.carrier');
// var roleLongRangeHarvester = require('role.longRangeHarvester');




/**
 * Summary. Process creep
 */
Creep.prototype.getRoleConfig = function() {
    var myRole = this.memory.role;
    return config.Roles.filter(function (r) { return r.roleName == myRole })[0];
}
/**
 * Summary. Process creep
 */
Creep.prototype.run = function () {
    if (this.memory.currentRole == null){
        this.log("roles is null",LogLevel.DEBUG);
        this.memory.currentRole = this.memory.role
        return;
    }
    this.log("Run(); Role:" + this.getRoleConfig().roleName + "; Task: " + this.memory.task + "; E: " + this.store[RESOURCE_ENERGY] + '/' + this.store.getFreeCapacity(RESOURCE_ENERGY),LogLevel.DEBUG);

    /* Review Creep
    */
    //console.log("mem " + this.memory.tickBeforeRenew);
    this.log("tickBeforeRenew " + this.memory.tickBeforeRenew ,LogLevel.DEBUG);
    if (this.memory.tickBeforeRenew == null) {
        this.log("tickBeforeRenew role " + this.getRoleConfig().tickBeforeRenew ,LogLevel.DEBUG);
        this.memory.tickBeforeRenew = this.getRoleConfig().tickBeforeRenew;
    } else if (this.memory.tickBeforeRenew == 0) {
        this.log("Eval Renewing",LogLevel.DEBUG);
        if(this.review()) { return };
    } else {
        this.memory.tickBeforeRenew -= 1;
    }
    
    /* Find what to do
    */
    if (this.memory.currentRole == Role.WORKER) {
        roleWorker.run(this);
    } else if (this.memory.role == Role.MINER) {
        roleMiner.run(this);
    } else if (this.memory.role == Role.CARRIER) {
        roleCarrier.run(this);
    } else if(this.memory.role == Role.UPGRADER) {
        roleUpgrader.run(this);
    }
        
};




/**
 * Summary. Review creep should recycle or repair
 */
Creep.prototype.review = function () {
    /* Is old Model?
    */
    //roles[this.memory.role].tickBeforeRenew
    bodyCode = this.getBodyCost();
    var maxBodySize = Game.rooms[Memory.primaryRoom].energyCapacityAvailable

    if (this.getRoleConfig.maxbodyCost <= maxBodySize){
        maxBodySize == this.getRoleConfig.maxbodyCost
    }

    /**
     *  Old Model
     */
    if (this.getBodyCost() < maxBodySize - 150) { // 150 allow for rounding
        // Disable to allow new model to be created
        this.memory.AllowRenewing = false;
    } else {
        this.memory.AllowRenewing = true;
    }

    /* Deal with renewing
    */
    if (config.Creep.Renew.Allow
        && this.room.noOfCreeps > 1
        && this.memory.AllowRenewing != false
        && ((this.ticksToLive < this.getRoleConfig().renewAt)
            || (this.memory.renewing && this.ticksToLive < config.Creep.Renew.UpTo)
            ) ) {

        /* Max number of creeps allowed to renew
        */
        if (this.memory.renewing == false
            && (this.getRoleConfig().enforeMaxNoOfCreepReviewAtOnce == false || _.sum(this.room.find(FIND_MY_CREEPS), (c) => c.memory.renewing == true) >= (config.Creep.Renew.AtSameTime - 1)))
        {
            // TODo LongRangeHarvester must not go if cant make it this.getRoleConfig().roleName == ""LongRangeHarvester"

            
            this.memory.tickBeforeRenew = 5; // try again later
            return false;
        }
        
        this.memory.task = CreepTasks.RENEWING;
        this.memory.renewing = true;
        var spawn = this.room.find(FIND_MY_SPAWNS)[0];
        var r = spawn.renewCreep(this);
        this.log("Renewing outcome - " + r, LogLevel.INFO)
        if (r == ERR_NOT_IN_RANGE) {
            this.setTask(CreepTasks.RENEWING_MOVING_TO_SPAWN);
            this.moveTo(spawn);
            return true;
        } else if (r == ERR_FULL) {
            this.memory.renewing = false;
            this.memory.tickBeforeRenew = this.getRoleConfig().tickBeforeRenew;
            this.log("Renewal complete", LogLevel.INFO)
            return false;
        }
    } else if (this.memory.recycle) {
        /* Handles recycling
        */
        var spawn = this.room.find(FIND_MY_SPAWNS)[0];
        var r = spawn.recycleCreep(this);
        this.log("Recycling - " + this.name + ' - ' + r, LogLevel.INFO)
        if (r == ERR_NOT_IN_RANGE) {
            this.setTask(CreepTasks.RECYCLING);
            this.moveTo(spawn);
        }
        return true;
    } else {
        this.memory.renewing = false
        this.memory.tickBeforeRenew = this.getRoleConfig().tickBeforeRenew;
        return false;
    }
}


Creep.prototype.collectEnergy = function (havevestIsNone) {
    this.log("collectEnergy - looking", LogLevel.DEBUG)
    // Already on route 
    if (this.memory.useSource != null && this.body.findIndex(b => b.type == "work") !== -1) {
        this.log("useSource is set", LogLevel.DEBUG)
        this.harvestSource();
        return;
    }

    

    /* Look for dropped items
    */
    var dropped = this.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
        filter: (d) => {return (d.resourceType == RESOURCE_ENERGY && d.amount > 50)}
    });

    if (dropped !== null) {
        this.log("collectEnergy Dropped:" + dropped, LogLevel.INFO);
        if(this.pickup(dropped) == ERR_NOT_IN_RANGE) {
            this.moveTo(dropped);
        }
        return;
    }

    /* head to container
    */
    var container = this.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER 
                    && structure.store[RESOURCE_ENERGY] > this.store.getFreeCapacity(RESOURCE_ENERGY)
                    && structure !== this.room.controllerContainer
                );
        }
    });

    if (container == null) {
        
        container = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0);
            }
        });
    };

    if (container !== null) {
        this.log("collectEnergy container:" + container, LogLevel.INFO);
        let r = this.withdraw(container, RESOURCE_ENERGY);
        this.log("withdraw container: " + r, LogLevel.DEBUG);
        if ( r == ERR_NOT_IN_RANGE) {
            let r = this.moveTo(container);
            this.log("move to container: " + r, LogLevel.DEBUG);
        }
        return;
    }
        else if (havevestIsNone == true && this.body.findIndex(b => b.type == "work") !== -1) {
        /* eught should happen 
        */
        if (this.harvestSource()) { return };
    }

    // /* Out of Energy in room
    // */
    // this.moveTo(Game.flags.W7N3_WaitForEnergy);

    //W7N3_WaitForEnergy()

}


//     /**
//      * Summary. Assign creep a new role
//      */
//     Creep.prototype.newRole = function (roleName) {
//         this.memory.role = roleName;
//         this.memory.currentRole = roleName;
//     }

/**
 * Summary. Get cost of creep
 * @return integer 
 */


//     /**
//      * Summary. Havest E
//      * @return void
//      */
Creep.prototype.harvestSource = function (source) {
    if (this.memory.forceSource != null) {
        var sources = this.room.find(FIND_SOURCES);
        source = sources[creep.memory.forceSource];
    } else if (this.memory.useSource != null) {
        source = Game.getObjectById(this.memory.useSource)
        //  this.memory.task = "harvesting from " + source.id;
    } else {
        var sources = this.room.find(FIND_SOURCES);
        source = sources[_.random(0, sources.length-1)]
        this.memory.useSource = source.id;
        // this.memory.task = "harvesting from new source" + source.id;
    }
    
    var r = this.harvest(source);
    if (r == ERR_NOT_IN_RANGE) {
        this.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
        return true;
    } else if (r == OK) {
        return true;
    } else if (r == ERR_NOT_ENOUGH_RESOURCES) {
        return false;
    } else {
        console.log( r + ' - harvest failed')
    }

}

//     /**
//      * Summary. dropOffEnergy at room target
//      * @return boolean 
//      */
Creep.prototype.dropOffEnergy = function () {
    var target;
    /* Find existing target
    */
    target = Game.getObjectById(this.memory.workerTarget);
    this.log("Drop off target (old) " +target + ';', LogLevel.DEBUG)
    if (target !== null && target.store && target.store.getFreeCapacity(RESOURCE_ENERGY) == 0) { // is still valid?
        //target.store.getFreeCapacity(RESOURCE_ENERGY) == 0
        target = null;
        this.memory.workerTarget = null
        this.taskCompleted();
    }

    /* get new target
    */
    if (target == null) {
        target = this.room.getEnergyDropTarget(this.pos);
    };
    //this.log("Drop off target" +target + '; Free: ' + target.store.getFreeCapacity(RESOURCE_ENERGY), LogLevel.DEBUG)
    if (target == null) {
        return false;
    }

    this.memory.workerTarget = target.id;
    this.setTask(CreepTasks.DROPOFF_ENERGY);
    
    var r = this.transfer(target, RESOURCE_ENERGY)
    if (r == ERR_NOT_IN_RANGE) {
        this.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
    } 
    return true;
}


//     /**
//     * Summary. Process creep
//     * @return boolean - ture in home room, false moving
//     */
//     Creep.prototype.goHomeRoom = function () {
//         var homeRoom = Game.rooms[Memory.primaryRoom];
//         if (homeRoom == this.room) {
//             return true; // Creep is home
//         } else {
//             var exits = this.room.findExitTo(homeRoom);
//             this.moveTo(this.pos.findClosestByRange(exits));
//             return false;
//         }
//     }


//     /**
//     * Summary. Is in home room
//     * @return boolean - ture in home room, false moving
//     */
//     Creep.prototype.isHome = function () {
    
//         var homeRoom = Game.rooms[Memory.primaryRoom];
//         if (homeRoom == this.room) {
//             return true; // Creep is home
//         } else {
//             return false;
//         }
//     }

//    /**
//    * Summary. 
//    * @return boolean - ture in home room, false moving
//    */
Creep.prototype.upgradeRoomController = function () {
    if (this.setTask(CreepTasks.UPGRADE_CONTROLLER)){
        this.memory.workerTarget = this.room.controller.id;
    };
    if (this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
        this.moveTo(this.room.controller, { visualizePathStyle: { stroke: '#ffaa00' } });
    }
}

Creep.prototype.getTask = function () {
    var currentTask = this.memory.task;
    if (currentTask == CreepTasks.FIND_ENERGY && this.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
        this.taskCompleted();
        return false;
    };
    return currentTask;
}

Creep.prototype.setTask = function (task) {
    if(this.memory.task !== task) {
        this.log("Task changed to " + task + ' from ' + this.memory.task, LogLevel.INFO);
        this.memory.task = task;
        return true;
    } else {
        return false;
    }
    
}


Creep.prototype.taskCompleted = function () {
    var currentTask = this.memory.task;
    this.memory.task = null;
    /* clean temp var
    */
    this.memory.useSource = null;
    this.memory.currentRole = this.memory.role; // Reset to primary role
    return this.review();
}

Creep.prototype.buildIt = function (target) {
    this.log("building " + target + '; Progess: ' + target.progress, LogLevel.INFO);
    var r = this.build(target)
    this.log("build outcome: " + r, LogLevel.DEBUG);
    if(r == ERR_NOT_IN_RANGE) {
        this.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
    }
}
