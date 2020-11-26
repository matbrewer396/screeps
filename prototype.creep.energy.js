Creep.prototype.collectEnergy = function (havevestIsNone) {
    this.log("collectEnergy - looking", LogLevel.DEBUG)
    this.memory.workerTarget = null;
    this.memory.lastWithDraw = null;
    this.memory.lastWithDrawExpiry = null;
    // Already on route 
    if (this.memory.useSource != null && this.body.findIndex(b => b.type == "work") !== -1) {
        this.log("useSource is set", LogLevel.DEBUG)
        this.harvestSource();
        return;
    }



    /* Look for dropped items
    */
    var dropped = this.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
        filter: (d) => { return (d.resourceType == RESOURCE_ENERGY && d.amount > 50) }
    });

    if (dropped !== null) {
        this.log("collectEnergy Dropped:" + dropped, LogLevel.INFO);
        if (this.pickup(dropped) == ERR_NOT_IN_RANGE) {
            this.moveTo(dropped);
        }
        return;
    }


    let container;
    container = this.pos.findClosestByRange(FIND_TOMBSTONES, {
        filter: (d) => { return (d.store[RESOURCE_ENERGY] > 0) }
    });

    /* head to container
    */
    if (!container) {
        container = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER
                    && (structure.store[RESOURCE_ENERGY] > this.store.getFreeCapacity(RESOURCE_ENERGY) // has more e and creep cap
                        || structure.store[RESOURCE_ENERGY] > 200)
                    && Game.rooms[this.pos.roomName].controllerContainers().filter(function (r) { return r.id == structure.id }).length == 0
                );
            }
        });
    }


    this.log("CE; container: " + container, LogLevel.DEBUG)

    if (container == null) {
        container = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_STORAGE
                    && (structure.store[RESOURCE_ENERGY] > this.room.withDrawLimit()
                        || this.room.isHealthy() == false
                        || this.memory.role == Role.CARRIER) // CARRIER can take to spawn
                    && structure.store[RESOURCE_ENERGY] > 0
                );
            }
        });
    }

    if (container == null && this.getRoleConfig.collectFromAnyConainter) {

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
        this.memory.lastWithDraw = container.id;
        this.memory.lastWithDrawExpiry = config.Creep.DropOff.LastWithDrawExpiry;
        if (r == ERR_NOT_IN_RANGE) {
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


Creep.prototype.harvestSource = function (source) {
    if (this.memory.forceSource != null) {
        var sources = this.room.find(FIND_SOURCES);
        source = sources[this.memory.forceSource];
    } else if (this.memory.useSource != null) {
        source = Game.getObjectById(this.memory.useSource)
        if (source.energy == 0 && source.ticksToRegeneration > config.Creep.Harvesting.Drained.WaitIfTickLessThen) {
            source = FindNewSource(this);
        }
    } else {
        source = FindNewSource(this);
    }

    if (!source) {
        this.memory.useSource = null
        return
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
        this.log("Harvest Failed: " + r + '; Source: ' + source, LogLevel.ERROR);
    }

}

function FindNewSource(creep) {
    var sources = creep.room.find(FIND_SOURCES, { filter: (s) => s.energy > 0 });
    if (sources.length == 0) {
        creep.log("New sources with energy", LogLevel.DEBUG);
    } else {
        let s = sources[_.random(0, sources.length - 1)]
        creep.memory.useSource = s.id;
        return s
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
    this.log("DE; Drop off target (old) " + target + ';', LogLevel.DEBUG)

    if ((target && target.store && (target.store.getFreeCapacity(RESOURCE_ENERGY) == 0 || this.room.controllerContainers().filter(function (r) { return r.id == target.id }).length > 0))
        || (target && !target.store) // target doesnt have store
    ) { // is still valid?
        this.log("DE; Target no longer valid " + target + ';', LogLevel.DEBUG)
        target = null;
        this.memory.workerTarget = null
        this.taskCompleted();
    }

    /** long range havester go direct  */
    if (this.getRoleConfig().dropOffAtUpgradeContainer) {
        target = this.room.findUpgradeControllerWithSpace()[0]
    }
    
    if (this.getRoleConfig().dropOffAtStorage && this.room.isHealthy()) {
        target = this.room.storage;
    }

    

    /* get new target
    */
    if (target == null) {
        target = this.pos.getEnergyDropTarget();
        this.log("DE; pos.getEnergyDropTarget: " + target + ';', LogLevel.DEBUG)
    };

    
    //this.log("Drop off target" +target + '; Free: ' + target.store.getFreeCapacity(RESOURCE_ENERGY), LogLevel.DEBUG)
    if (target == null) {
        return false;
    }

    if (this.memory.lastWithDraw == target.id) {
        if (this.memory.lastWithDrawExpiry > 0) {
            this.memory.lastWithDrawExpiry -= 1;
            return false;
        } else {
            this.memory.lastWithDraw = undefined
            this.memory.lastWithDrawExpiry = undefined
        }

    }

    this.memory.workerTarget = target.id;
    this.setTask(CreepTasks.DROPOFF_ENERGY);

    var r = this.transfer(target, RESOURCE_ENERGY)
    if (r == OK) {
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


Creep.prototype.pickupDropped = function (maxRange) {
    var dropped = this.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
        filter: (d) => { return (d.resourceType == RESOURCE_ENERGY && d.amount > 50) }
    });

    if (maxRange) {
        if (this.pos.getRangeTo(dropped) > maxRange) {
            return
        }
    }


    if (dropped !== null) {
        this.log("collectEnergy Dropped:" + dropped, LogLevel.INFO);
        if (this.pickup(dropped) == ERR_NOT_IN_RANGE) {
            this.moveTo(dropped);
        }
        return;
    }
}
