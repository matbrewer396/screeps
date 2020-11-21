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