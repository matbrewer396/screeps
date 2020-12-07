Creep.prototype.collectResource = function (harvestIsNone) {
    this.log("collectResource - processing", LogLevel.DEBUG)
    this.memory.workerTarget = null;
    this.memory.lastDropOffTarget = null;
    // Already on route 
    if (this.memory.useSource != null && this.canWork()) {
        this.log("useSource is set", LogLevel.DEBUG)
        this.harvestSource();
        return;
    }
    // already on route to something
    let target = Game.getObjectById(this.memory.collectResourceTarget)
    if (target) {
        this.log("Exiting target: " + target, LogLevel.DEBUG)
        if (target.resourceType) {
            this.pickupDroppedResource(target)
        } else {
            this.withDrawResource(target)
        }
        
        return
    } else if (this.memory.collectResourceTarget) {
        this.memory.collectResourceTarget = null
        this.room.removeWithDrawLedger(this.name)
    }

    this.log("collectResource - looking", LogLevel.DEBUG)

    let myConfig = this.getRoleConfig().pickUpNonEnergy;
    /* Look for dropped items
    */
    var dropped = this.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
        filter: (d) => {
            return (suitableTarget(myConfig, d)
            )
        }
    });
    this.log("dropped: " + dropped, LogLevel.DEBUG)
    if (dropped) {
        this.pickupDroppedResource(dropped);
        return;
    }


    let container;
    container = this.pos.findClosestByRange(FIND_TOMBSTONES, {
        filter: (d) => {
            return suitableTarget(myConfig, d)
        }
    });

    /* head to container
    */
    let resourceFilter = RESOURCE_ENERGY;
    if (!container) {
        container = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                if (structure.structureType !== STRUCTURE_CONTAINER) { return false }
                let minToBeValid = this.store.getFreeCapacity(resourceFilter)
             
                //if (minToBeValid > 200) { minToBeValid = 200 }
                return suitableTarget(myConfig, structure, { resourceFilter: resourceFilter, minToBeValid: minToBeValid, notId: this.memory.lastWithDraw })
            }
        });
    }


    this.log("CE; container: " + container, LogLevel.DEBUG)

    if (!container) {
        container = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return suitableTarget(myConfig, structure, { resourceFilter: resourceFilter, notId: this.memory.lastWithDraw });
            }
        });
    }


    if (container) {
        this.withDrawResource(container,resourceFilter)
        return;
    } else if (harvestIsNone == true && this.canWork()) {
        /* eught should happen 
        */
        if (this.harvestSource()) { return };
    } else { // Out of Energy in room
        this.log("No resources to collect ", LogLevel.DEBUG);
        this.room.removeWithDrawLedger(this.name);
        this.taskCompleted();
    }

    // /* Out of Energy in room
    // */
    // this.moveTo(Game.flags.W7N3_WaitForEnergy);

    //W7N3_WaitForEnergy()

}

Creep.prototype.withDrawResource = function (target, resourceFilter) {
    this.log("collectResource container:" + target, LogLevel.INFO);
    
    if (!this.pos.isNearTo(target)) {
        this.moveTo(target, config.MoveTo.withDraw);
    }
    let resourceFixed = true;

    // if (target && !target.store) {
    //     console.log("Target with out store " + target)
    // }

    if (!resourceFilter && this.getRoleConfig().pickUpNonEnergy) {
        if (target.store) {
            resourceFilter = target.store.getResources()[0]
        } else {
            resourceFilter = RESOURCE_ENERGY
        }
        resourceFixed = false
    } else if (!resourceFilter) {
        resourceFilter = RESOURCE_ENERGY
    }
    this.room.addWithDrawLedger(target.id, this.name, this.store.getFreeCapacity(resourceFilter))
    let r = this.withdraw(target, resourceFilter);
    this.log("withdraw container: " + r, LogLevel.DEBUG);
    if (r == ERR_NOT_IN_RANGE) {
        this.memory.collectResourceTarget = target.id;
    } else if ((target.store && target.store.getResources().length <= 1) || resourceFixed) {
        this.memory.lastWithDraw = target.id;
        this.memory.lastWithDrawExpiry = config.Creep.DropOff.LastWithDrawExpiry;
        this.memory.workerTarget = null;
        this.memory.collectResourceTarget  = null;
        this.room.removeWithDrawLedger(this.name)
    }

}



function suitableTarget(myConfig, obj, opt) {
    let resourceFilter = RESOURCE_ENERGY;
    let minToBeValid = 10;
    if (myConfig.pickUpNonEnergy) { resourceFilter = null } // assume energy only if not allowed
    if (opt && opt.resourceFilter) { resourceFilter = opt.resourceFilter }

    if (resourceFilter == RESOURCE_ENERGY) {
        minToBeValid = 80
    }

    let availableResources  = 0
    if (obj.amount) { // 
        availableResources  = obj.amount
    }
    if (obj.store) { // container or tombstone 
        availableResources = obj.store[resourceFilter] 
    }
    if (availableResources < minToBeValid) { return false }; // not worth it
    if (obj.room.getWithDrawLedgerTotal(obj.id) + 200 > availableResources ) {
        return false
    }
    
    
    if (opt && opt.minToBeValid) { minToBeValid = opt.minToBeValid }

    if (!resourceFilter && obj.resourceType == RESOURCE_ENERGY) { return false }
   
    // dont pick up from the same target
    if (opt && opt.notId && opt.notId == obj.id){
        return false 
    }

    if (obj.structureType) {
        if (obj.structureType == STRUCTURE_CONTAINER) {
            if (obj.store[resourceFilter] < minToBeValid) { return false }
            // not for upgrader
            if (obj.room.controllerContainers().filter(function (r) { return r.id == obj.id }).length > 0) { return false }
        } else if (obj.structureType == STRUCTURE_STORAGE) {
            if (!obj.room.isHealthy()  // allow worker to pull when in trouble  
                || myConfig.withLimitlessFromStorage) {

            } else if (obj.store[RESOURCE_ENERGY] < obj.room.withDrawLimit()) { return false }

        } else {
            return false // some other structure 
        }


    }



    return true
}

Creep.prototype.transferFromContainer = function () {
    let container = this.pos.getContainerRightNextTo()
    if (container) {
        let r = this.withdraw(container)
        this.log("transferFromContainer outcome: " + r, LogLevel.ALWAYS);
    }
}


Creep.prototype.pickupDroppedResource = function (dropped) {
    this.log("pickupDroppedResource Dropped:" + dropped, LogLevel.INFO);
    if (!this.pos.isNearTo(dropped)) {
        this.moveTo(dropped);
        this.room.addWithDrawLedger(dropped.id, this.name, this.store.getFreeCapacity(RESOURCE_ENERGY))
        this.memory.collectResourceTarget = dropped.id;
        
    }
    
    if (this.pos.isNearTo(dropped)) {
        let r = this.pickup(dropped);
        this.log("pickupDroppedResource outcome: " + r, LogLevel.INFO);
        this.transferFromContainer()
    }
    
    
    // let r = this.pickup(dropped);
    // this.log("pickupDroppedResource outcome: " + r, LogLevel.INFO);
    // if (r == ERR_NOT_IN_RANGE) {
    //     this.memory.collectResourceTarget = dropped.id;
    // }
    
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
    this.room.removeWithDrawLedger(this.name)
    var target;
    /* Find existing target
    */
    target = Game.getObjectById(this.memory.workerTarget);
    this.log("DE; Drop off target (old) " + target + ';', LogLevel.DEBUG)

    if ((target && target.store 
        && (target.store.getFreeCapacity(RESOURCE_ENERGY) == 0 || this.room.controllerContainers().filter(function (r) { return r.id == target.id }).length > 0))
        || (target && !target.store) // target doesnt have store
    ) { // is still valid?
        this.log("DE; Target no longer valid " + target + ';', LogLevel.DEBUG)
        target = null;
        this.memory.workerTarget = null
        this.taskCompleted();
    }

    /** long range havester go direct  */
    if (this.getRoleConfig().dropOffAtUpgradeContainerFirst) {
        target = this.room.findUpgradeControllerWithSpace()[0]
    }

    if (this.getRoleConfig().dropOffAtStorageFirst && this.room.isHealthy() && this.room.storage) {
        target = this.room.storage;
    }



    /* get new target
    */
    if (!target) {
        this.log("DE; lastDropOffTarget: " + this.memory.lastDropOffTarget, LogLevel.DEBUG)
        target = this.pos.getEnergyDropTarget(this.memory.lastDropOffTarget);
        this.log("DE; pos.getEnergyDropTarget: " + target + ';', LogLevel.DEBUG)
    };


    if (!target) {
        target = this.room.findUpgradeControllerWithSpace()[0]
    }
    if (!target && this.room.storage) {
        target = this.room.storage;
    }

    //this.log("Drop off target" +target + '; Free: ' + target.store.getFreeCapacity(RESOURCE_ENERGY), LogLevel.DEBUG)
    if (!target) {
        this.log("DE; not targets found ", LogLevel.DEBUG)
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
        this.memory.lastDropOffTarget = this.memory.workerTarget;
        this.memory.workerTarget = null;
        this.taskCompleted()
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

    let dropped = this.pos.findClosestByRange(FIND_TOMBSTONES, {
        filter: (d) => { return (d.resourceType == RESOURCE_ENERGY && d.amount > 20) }
    });
    let rangeTo = this.pos.getRangeTo(dropped);
    this.log("found tome: " + dropped + "; RangeTo: " + rangeTo, LogLevel.DEBUG)

    if (maxRange && rangeTo > maxRange) { dropped = undefined }

    if (!dropped) {
        dropped = this.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
            filter: (d) => { return (d.resourceType == RESOURCE_ENERGY && d.amount > 50) }
        });

        rangeTo = this.pos.getRangeTo(dropped);
        this.log("found dropped: " + dropped + "; RangeTo: " + rangeTo, LogLevel.DEBUG)
    }

    if (maxRange && rangeTo > maxRange) {
        return false // out of range
    }

    if (dropped !== null) {
        this.log("collectResource Dropped:" + dropped, LogLevel.INFO);
        if (rangeTo > 1) {
            this.moveTo(dropped);
            if (rangeTo == 2) {
                this.pickup(dropped); // now in range 
            }
        } else {
            if (this.pickup(dropped) == ERR_NOT_IN_RANGE) {
                this.moveTo(dropped);
            }
        }

        return true;
    }
}




