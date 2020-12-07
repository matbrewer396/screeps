Room.prototype.checkMemory = function () {
    if (!this.memory.remoteSources) { this.memory.remoteSources = [] };
    if (this.memory.task == undefined) { this.memory.task = new Object(); };
    if (!this.memory.withDrawLedge) { this.memory.withDrawLedge = [] };
    this.memory.spawnsBusy = [];
}


Room.prototype.removeCreepFromMemory = function (creepName, workQueuesOnly) {
    if (workQueuesOnly) {
        
    }
    this.removeWithDrawLedger(creepName)
}




Room.prototype.isTaskDueToStart = function (taskName) {
    let taskToRenewAt = this.memory.task[taskName];
    if (taskToRenewAt == undefined) {
        return true;
    } else if (taskToRenewAt <= 1) {
        return true
    } else {
        taskToRenewAt -= 1;
        this.setTaskToRenew(taskName, taskToRenewAt)
        return false;
    }
}
Room.prototype.setTaskToRenew = function (taskName, ticksToReview) {
    this.memory.task[taskName] = ticksToReview;
}




Room.prototype.isRemoteSourceKnown = function (newSource) {
    return (this.memory.remoteSources.filter(function (s) {
        return (s.x == newSource.x && s.y == newSource.y && s.roomName == newSource.roomName)
    }).length > 0)
}

Room.prototype.addRemoteSource = function (newSource) {
    if (this.isRemoteSourceKnown(newSource)) {
        return
    }
    this.log("New remote minding source add: " + JSON.stringify(newSource))
    this.memory.remoteSources.push(newSource);
}

//{id:xxx, creep: xxxx, freeCapacity: }
Room.prototype.addWithDrawLedger = function (targetId, creepName, freeCapacity) {
    this.removeWithDrawLedger(creepName)
    this.memory.withDrawLedge.push(
        {
            id: targetId,
            creepName: creepName,
            freeCapacity: freeCapacity,
        }
    )
}

Room.prototype.removeWithDrawLedger = function (creepName) {
    this.memory.withDrawLedge = this.memory.withDrawLedge.filter(function (o) {
        return o.creepName !== creepName
    })
}

Room.prototype.getWithDrawLedgerTotal = function (id) {
    let l = this.memory.withDrawLedge.filter(function (o) {
        return o.id == id
    })
    let freeCapacity = 0
    l.forEach(function (entry) {
        freeCapacity += entry.freeCapacity
    })
    return freeCapacity
}