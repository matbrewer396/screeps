Creep.prototype.handleRenewCreepOutCome = function (outcome,spawn,allowRecall) {
    this.log("Renewing outcome - " + r, LogLevel.INFO)
    if (outcome == OK) {
        spawn.renewRequested = true
        return true;
    } else if (outcome == ERR_NOT_IN_RANGE) {
        this.setTask(CreepTasks.RENEWING_MOVING_TO_SPAWN);
        this.moveTo(spawn);
        if (this.pos.getRangeTo(spawn) <= 1 && allowRecall){
            outcome = spawn.renewCreep(this)
            return this.handleRenewCreepOutCome(outcome,spawn,false)
        }
        return true;
    } else if (outcome == ERR_FULL) {
        this.memory.renewing = false;
        this.memory.tickBeforeReview = this.getRoleConfig().tickBeforeReview;
        this.log("Renewal complete", LogLevel.INFO)
        return false;
    } else if (outcome == ERR_NOT_ENOUGH_ENERGY) {
        if (this.store[RESOURCE_ENERGY] > 0) {
            this.transfer(spawn, RESOURCE_ENERGY)
            if (allowRecall){
                outcome = spawn.renewCreep(this)
                return this.handleRenewCreepOutCome(outcome,spawn,false)
            }
            return true;
        }
        let retryIn = config.Creep.Renew.TickBeforeRetry
        if (this.ticksToLive < retryIn) {
            if (this.ticksToLive < config.Creep.Renew.LastHopeProtocol) {
                var r = spawn.recycleCreep(this);
                this.log("Recycling as last hoper outcome: " + r, LogLevel.ERROR)
                return true
            } else {
                retryIn = this.ticksToLive - config.Creep.Renew.LastHopeProtocol
            }
        }
        this.memory.renewing = false;
        this.memory.tickBeforeReview = retryIn;
        this.log("Spawn out of e", LogLevel.INFO)
        return false;
    } else if (outcome == ERR_BUSY) {
        spawn = this.room.findFreeSpawns(this)[0];
        if (spawn && allowRecall){
            outcome = spawn.renewCreep(this)
            return this.handleRenewCreepOutCome(outcome,spawn,false)
        }
        this.log("Spawn is busy", LogLevel.DEBUG)
    } else {
        this.log("Unhandled renewing outcome" + r, LogLevel.ERROR);
    }
}


/**
 * Summary. Review creep should recycle or repair
 */
Creep.prototype.review = function (force) {
    if (!force) { force = false }
    this.log("Reviewing Creep; Force: " + force, LogLevel.INFO);

    /* Is old Model?
    */
    //roles[this.memory.role].tickBeforeReview
    bodyCode = this.getBodyCost();
    var maxBodySize = Game.rooms[Memory.primaryRoom].energyCapacityAvailable

    if (this.getRoleConfig().maxBodyCost <= maxBodySize) {
        maxBodySize = this.getRoleConfig().maxBodyCost
    }
    
    /**
     *  Old Model
     */
    if (this.getBodyCost() < maxBodySize - 150 // 150 allow for rounding
        && this.body.length !== 50) { 
        // Disable to allow new model to be created
        
        this.log("Old Model - BodyCode: " + this.getBodyCost() + "; maxBodySize: " +maxBodySize-150 ,LogLevel.ALWAYS)
        this.memory.AllowRenewing = false;
    } else {
        this.memory.AllowRenewing = true;
    }

    let renewAt = (this.memory.ticksToSource * 1.8); // creep in the feild
    if (!renewAt) {
        renewAt = this.getRoleConfig().renewAt;
    }

    this.log("AllowRenewing: " + this.memory.AllowRenewing
        + '; ConfigAllow: ' + config.Creep.Renew.Allow
        + '; ticksToLive: ' + this.ticksToLive
        + '; noOfCreep: ' + this.room.find(FIND_MY_CREEPS).length
        + '; renewing: ' + this.memory.renewing
        + '; renewAt: ' + renewAt

        ,
        LogLevel.DEBUG
    )



    /* Deal with renewing
    */
    if (config.Creep.Renew.Allow
        && this.memory.AllowRenewing != false
        && this.room.find(FIND_MY_CREEPS).length > 1
        && (this.ticksToLive < renewAt
            || (this.memory.renewing && this.ticksToLive < config.Creep.Renew.UpTo)
            || force
        )) {

        if (force) {this.memory.tickBeforeReview = 0 }

        this.log("Renew creep", LogLevel.DEBUG);
        // /* Max number of creeps allowed to renew
        // */
        // if (this.memory.renewing == false
        //     && !force
        //     && (this.getRoleConfig().enforeMaxNoOfCreepReviewAtOnce == false ||
        //         _.sum(this.room.find(FIND_MY_CREEPS), (c) => c.memory.renewing == true) >= (config.Creep.Renew.AtSameTime))) {
        //     this.log("Creep already renewing", LogLevel.INFO);
        //     // TODo LongRangeHarvester must not go if cant make it this.getRoleConfig().roleName == ""LongRangeHarvester"
        //     this.memory.tickBeforeReview = 5; // try again later
        //     return false;
        // }

        this.memory.renewing = true;
        var spawns = this.room.findSpawns()
        var spawn;
        for (i in spawns) {
            console.log(spawns[i])
            if (!spawns[i].isBusy(this,true)) {
                spawn = spawns[i]
            }
        }
        
        console.log(spawn + spawn.isBusy())
        /** No spawn in this room */
        if (!spawn) {
            this.log("No free spawn", LogLevel.INFO);
            if (force || this.getRoleConfig().blockSpawnRetryLater) {
                this.log("Force set / role block - trying anyway ", LogLevel.ALWAYS);
                spawn = this.room.findMainSpawns();
            } else {
                this.log("will return later", LogLevel.DEBUG);
                this.memory.tickBeforeReview = 60;
                return false;
            }
            
        }
        console.log(this.room.findFreeSpawns(this,true))
        console.log(spawn + spawn.isBusy())

        if (!spawn) {
            this.log("no spawn in this room", LogLevel.INFO);
            this.memory.tickBeforeReview = 60;
            return false;
        }
        

        // if (spawn && !this.pos.inRangeTo(spawn.pos,1)){
        //     this.log("spwan not in range moving", LogLevel.INFO);
        //     this.moveTo(spawn);
        //     return true;
        // }

        this.setTask(CreepTasks.RENEWING);
        


        var r = spawn.renewCreep(this);
        return this.handleRenewCreepOutCome(r,spawn,true);
    } else if (this.memory.recycle) {
        /* Handles recycling
        */
        var spawn = this.room.find(FIND_MY_SPAWNS)[0];
        if (!spawn) {
            this.log("No spawn in room", LogLevel.INFO)
            this.moveToRoom(nav.findClosetMyRoom(this))
            return true
        }
        var r = spawn.recycleCreep(this);
        this.log("Recycling - " + this.name + ' - ' + r, LogLevel.INFO)
        if (r == ERR_NOT_IN_RANGE) {
            this.setTask(CreepTasks.RECYCLING);
            this.moveTo(spawn);
        }
        return true;
    } else {
        this.log("Renew - nothing", LogLevel.DEBUG);
        this.memory.renewing = false
        this.memory.tickBeforeReview = this.getRoleConfig().tickBeforeReview;
        return false;
    }
}

Creep.prototype.recycle = function () {
    this.memory.recycle = true
    this.memory.tickBeforeReview = 0 
    this.memory.AllowRenewing = false;
}


