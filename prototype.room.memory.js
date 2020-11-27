Room.prototype.isTaskDueToStart = function (taskName) {
    /* first time
    */
   
    if (this.memory.task == undefined){
        this.memory.task = new Object() ;
    };

    let taskToRenewAt = this.memory.task[taskName];
    if (taskToRenewAt == undefined){
        return true;
    } else if (taskToRenewAt <= 1 ) {
        return true
    } else {
        taskToRenewAt -= 1;
        this.setTaskToRenew(taskName,taskToRenewAt)
        return false;
    }

}

Room.prototype.setTaskToRenew = function (taskName, ticksToReview) {
    this.memory.task[taskName] = ticksToReview;
}

Room.prototype.isRemoteSourceKnown = function (newSource) {
    return ( this.memory.remoteSources.filter(function (s) {
        return (s.x == newSource.x && s.y == newSource.y && s.roomName == newSource.roomName )
       }).length > 0)
}

Room.prototype.addRemoteSource = function (newSource) {
    let remoteBySources = this.memory.remoteSources;
    if(!remoteBySources){
        this.memory.remoteSources = [];
    } else if(this.isRemoteSourceKnown(newSource)) {
        return
    }
    this.log("New remote minding source add: " + JSON.stringify(newSource))
    this.memory.remoteSources.push(newSource);
}