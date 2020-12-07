const { cond } = require('lodash');


Room.prototype.startUp = function () {
    this.checkMemory()
    
    this.log('startUp() is now processing. isPrimaryRoom: ' + this.isPrimaryRoom()
        + ";energyAvailable: " + this.energyAvailable
        + ";energyCapacityAvailable: " + this.energyCapacityAvailable
        + ";isUnderAttack: " + this.isUnderAttack()
        , config.roomSummary);

    /* Stats
    */
    // buildStats(this);

    // if (this.name = "W6N4") {
    //     console.log(this.find)
    // }


    if (this.isUnderAttack()) {
        this.log("UNDER ATTACK. isHostileOwn: " + this.isHostileOwn(), LogLevel.ALWAYS);
        /** ask for help */
        if ( _(Game.creeps).filter(
                {
                    memory: {
                        role: Role.GUARDIAN
                        , guardRoom: this.name
                    }

                }).value().length == 0) {
            Military.rapidResponseRequest(this.name)
        }
    }


    this.roomStage();
    /* Exit if not primary
    */
    if (this.isPrimaryRoom() == false) { return };



    // let c = Game.getObjectById("9e9507fbcc748d8")
    // console.log("getRepairAt-" + c.getRepairAt())//.Creep)
    // console.log(
    //     JSON.stringify(
    //         config.Room.Repair.filter(
    //             function (c) { return c.Objects.includes(STRUCTURE_RAMPART) }
    //         )[0].StartAt.Creep
    //     )
    // )

    //this.plan();

    // console.log(this.controllerContainers())

    
    if(this.rapidRecoverySpawning()) { return }
    if (this.isHealthy()) {this.rapidGuardianSpawning()}
    if (this.isTaskDueToStart("plan")) { this.plan() }
    
    this.bauSpawning()
    if (this.roomStage() >= RoomStage.OUTPOST) {
        this.reconFromHere();
        this.remoteMining();
    }

    this.remoteMining();
    baseBuilder(this);

};

Room.prototype.rapidGuardianSpawning = function () {
    if (!Memory.rapidResponseGuardianQueue) { Memory.rapidResponseGuardianQueue = []; return }; // init queue
    if (Memory.rapidResponseGuardianQueue.length == 0) { return } // no Response required

    if (Memory.rapidResponseGuardianQueue.length >  100) {
        this.log("rapidResponseGuardianQueue > 100", LogLevel.ERROR)
        Memory.rapidResponseGuardianQueue = []; 
        return 
    }

    
    if (this.energyAvailable < config.rapidGuardian.minBodySize) { return }
    if (this.findMainSpawns().getRoleOfCreepSpawning() && this.findMainSpawns().getRoleOfCreepSpawning() !== Role.GUARDIAN) {
        this.findMainSpawns().spawning.cancel()
        return
    };

    let room = Memory.rapidResponseGuardianQueue.shift()
    this.log("rapidResponseGuardianQueue activated " + room )

    let opt = {
        Memory: { guardRoom: room }
        , maxBodySize: config.rapidGuardian.maxBodySize
    }
    let spawnOutCome = spawnCreep(Role.GUARDIAN, this, opt);
    if (spawnOutCome == OK) { return }
    else {
        // failed
        Memory.rapidResponseGuardianQueue.push(room)
    }

}


Room.prototype.rapidRecoverySpawning = function () {
    /* spawn creeps - rapid recovery protocol  
    */
    if (this.creepsInRole(Role.WORKER) == 0 && this.energyAvailable >= 300) {
        spawnCreep(Role.WORKER, this);
        return true;
    }

    if (this.creepsInRole(Role.CARRIER) == 0
        && this.energyAvailable >= 600
        && this.storageReserve() > 0) {
        spawnCreep(Role.CARRIER, this);
        return true;
    }

    if (this.creepsInRole(Role.CARRIER) == 0
        && this.creepsInRole(Role.MINER) > 0
        && this.energyAvailable >= 600) {
        spawnCreep(Role.CARRIER, this)
        return true;
    }


}
let creepLogic = require('./roles');
Room.prototype.bauSpawning = function () {
    if (!this.findMainSpawns().isBusy()) {
        for (i in config.Roles) {
            let role = config.Roles[i];
            let maxBodyCost = config.Roles[i].maxBodyCost
            if (!maxBodyCost) { maxBodyCost = this.energyCapacityAvailable }
            if (this.energyAvailable < maxBodyCost) {
                continue
            }
            this.log("Role: " + role.roleName + ';', LogLevel.DEBUG);


            let noOf = this.creepsInRole(role.roleName);
            this.log("Role: " + role.roleName + '; Currently have: ' + noOf
                + "; Required: " + creepLogic[role.roleName].noRequiredCreep(this), LogLevel.DEBUG);
            if (noOf < creepLogic[role.roleName].noRequiredCreep(this)) {
                spawnCreep(role.roleName, this);
                break
            }
        }
    } else {
        this.log("Not Spawning. IsBusy: " + this.findMainSpawns().isBusy()
            + "; energyAvailable: " + this.energyAvailable
            + "; energyAvailable: " + this.energyCapacityAvailable, LogLevel.DEBUG)
    }
}














