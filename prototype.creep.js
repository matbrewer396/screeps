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
    //console.log("mem " + this.memory.tickBeforeReview);
    this.log("tickBeforeReview " + this.memory.tickBeforeReview ,LogLevel.DEBUG);
    if (this.memory.tickBeforeReview == null) {
        this.log("tickBeforeReview role " + this.getRoleConfig().tickBeforeReview ,LogLevel.DEBUG);
        this.memory.tickBeforeReview = this.getRoleConfig().tickBeforeReview;
    } else if (this.memory.tickBeforeReview == 0) {
        this.log("Eval Renewing",LogLevel.DEBUG);
        if(this.review()) { return };
    } else {
        this.memory.tickBeforeReview -= 1;
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
    this.log("Reviewing Creep", LogLevel.INFO);

    /* Is old Model?
    */
    //roles[this.memory.role].tickBeforeReview
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

    this.log("AllowRenewing: " + this.memory.AllowRenewing 
        + '; ConfigAllow: ' + config.Creep.Renew.Allow
        + '; ticksToLive: ' + this.ticksToLive
        + '; noOfCreep: ' + this.room.find(FIND_MY_CREEPS).length
        + '; renewing: ' + this.memory.renewing
        
        ,
        LogLevel.DEBUG
    )

    /* Deal with renewing
    */
    if (config.Creep.Renew.Allow
        && this.memory.AllowRenewing != false
        && this.room.find(FIND_MY_CREEPS).length > 1
        && ((this.ticksToLive < this.getRoleConfig().renewAt)
            || (this.memory.renewing && this.ticksToLive < config.Creep.Renew.UpTo)
            ) ) {
        
        this.log("Renew creep",LogLevel.DEBUG );
        /* Max number of creeps allowed to renew
        */
        if (this.memory.renewing == false
            && (this.getRoleConfig().enforeMaxNoOfCreepReviewAtOnce == false || 
            _.sum(this.room.find(FIND_MY_CREEPS), (c) => c.memory.renewing == true) >= (config.Creep.Renew.AtSameTime)))
        {
            this.log("Creep already rewnewing",LogLevel.INFO );
            // TODo LongRangeHarvester must not go if cant make it this.getRoleConfig().roleName == ""LongRangeHarvester"
            this.memory.tickBeforeReview = 5; // try again later
            return false;
        }
        
        this.memory.task = CreepTasks.RENEWING;
        this.memory.renewing = true;
        var spawn = this.room.find(FIND_MY_SPAWNS)[0];
        var r = spawn.renewCreep(this);
        this.log("Renewing outcome - " + r, LogLevel.INFO)
        if (r == OK) {
            return true;
        } else if (r == ERR_NOT_IN_RANGE) {
            this.setTask(CreepTasks.RENEWING_MOVING_TO_SPAWN);
            this.moveTo(spawn);
            return true;
        } else if (r == ERR_FULL) {
            this.memory.renewing = false;
            this.memory.tickBeforeReview = this.getRoleConfig().tickBeforeReview;
            this.log("Renewal complete", LogLevel.INFO)
            return false;
        } else if (r == ERR_NOT_ENOUGH_ENERGY) {
            if (this.store[RESOURCE_ENERGY] > 0) {
                this.transfer(spawn, RESOURCE_ENERGY)
                return true;
            }


            let retryIn = config.Creep.Renew.TickBeforeRetry
            if (this.ticksToLive < retryIn){
                if (this.ticksToLive < config.Creep.Renew.LastHopeProtocol) {
                    var r = spawn.recycleCreep(this);
                    this.log("Recycling as last hoper outcome: " + r, LogLevel.ERROR)
                    return
                } else {
                    retryIn = this.ticksToLive
                }
            }
            this.memory.renewing = false;
            this.memory.tickBeforeReview = retryIn;
            this.log("Spawn out of e", LogLevel.INFO)
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
        this.log("Renew - nothing",LogLevel.DEBUG );
        this.memory.renewing = false
        this.memory.tickBeforeReview = this.getRoleConfig().tickBeforeReview;
        return false;
    }
}


Creep.prototype.collectEnergy = function (havevestIsNone) {
    this.log("collectEnergy - looking", LogLevel.DEBUG)
    this.memory.workerTarget = null;
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


    let container;
    container = this.pos.findClosestByRange(FIND_TOMBSTONES, {
        filter: (d) => {return (d.store[RESOURCE_ENERGY] > 0)}
    });

    /* head to container
    */
    if (!container){
        container = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER 
                        && ( structure.store[RESOURCE_ENERGY] > this.store.getFreeCapacity(RESOURCE_ENERGY) // has more e and creep cap
                            || structure.store[RESOURCE_ENERGY]  > 200 )
                        && Game.rooms[this.pos.roomName].controllerContainers().filter(function (r) { return r.id == structure.id}).length == 0
                    );
            }
        });
    }
    

    this.log("CE; container: " + container, LogLevel.DEBUG)

    if(!container && this.memory.role ==  Role.CARRIER) {
        container = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_STORAGE 
                    && structure.store[RESOURCE_ENERGY] > 0);
            }
        });
    }

    if (container == null && this.getRoleConfig.collectFromAnyConainter ) {
        
        container = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER 
                    && structure.store[RESOURCE_ENERGY] > 0);
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
    } else if (havevestIsNone == true && this.body.findIndex(b => b.type == "work") !== -1) {
        /* eught should happen 
        */
        if (this.harvestSource()) { return };
    } else { // Out of Energy in room
        this.taskCompleted();
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
        if (source.energy == 0 && source.ticksToRegeneration > config.Creep.Harvesting.Drained.WaitIfTickLessThen){
            FindNewSource(this);
        }
        //  this.memory.task = "harvesting from " + source.id;
    } else {
        FindNewSource(this);
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

function FindNewSource(creep){
    var sources = creep.room.find(FIND_SOURCES,{ filter: (s) => s.energy > 0 });
    if (sources.length == 0 ){
        creep.log("New sources with energy", LogLevel.DEBUG);
    } else {
        source = sources[_.random(0, sources.length-1)]
        creep.memory.useSource = source.id;
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
    this.log("DE; Drop off target (old) " +target + ';', LogLevel.DEBUG)
  
    if ( (target && target.store && (target.store.getFreeCapacity(RESOURCE_ENERGY) == 0 || this.room.controllerContainers().filter(function (r) { return r.id == target.id}).length > 0))
        || (target && !target.store) // target doesnt have store
    ) { // is still valid?
        this.log("DE; Target no longer valid " +target + ';', LogLevel.DEBUG)
        target = null;
        this.memory.workerTarget = null
        this.taskCompleted();
    }

    /* get new target
    */
    if (target == null) {
        target = this.pos.getEnergyDropTarget();
        this.log("DE; pos.getEnergyDropTarget: " +target + ';', LogLevel.DEBUG)
    };
    //this.log("Drop off target" +target + '; Free: ' + target.store.getFreeCapacity(RESOURCE_ENERGY), LogLevel.DEBUG)
    if (target == null) {
        return false;
    }

    this.memory.workerTarget = target.id;
    this.setTask(CreepTasks.DROPOFF_ENERGY);
    
    var r = this.transfer(target, RESOURCE_ENERGY)
    if (r == OK){
        this.log("Transferred", LogLevel.DEBUG)
    }
    else if (r == ERR_NOT_IN_RANGE) {
        this.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
    } else { // target not valid
        this.log("Target not valid. Outcome: " + r + '; Target: ' + target, LogLevel.ERROR)
        this.memory.workerTarget = null;
        this.taskCompleted()
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


Creep.prototype.isInjured = function () {
    return this.hitsMax > this.hits
}
