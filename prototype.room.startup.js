const { cond } = require('lodash');
let creepLogic = require('./roles');

Room.prototype.startUp = function () {
    this.log('startUp() is now processing. isPrimaryRoom: ' + this.isPrimaryRoom()
        + ";energyAvailable: " + this.energyAvailable
        + ";energyCapacityAvailable: " + this.energyCapacityAvailable
        , LogLevel.ALWAYS);

    /* Stats
    */
    // buildStats(this);


    if (this.isUnderAttack()) {
        this.log("UNDER ATTACK", LogLevel.ALWAYS);

        /** ask for help */
        if (!Memory.rapidResponseGuardianQueue.includes(this.name)
            && _(Game.creeps).filter(
                {
                    memory: {
                        role: Role.GUARDIAN
                        , guardRoom: this.name
                    }

                }).value().length == 0) {
            Memory.rapidResponseGuardianQueue.push(room)
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

    this.rapidGuardianSpawning()
    this.rapidRecoverySpawning()
    this.plan()
    this.bauSpawning()
    if (this.roomStage() >= RoomStage.OUTPOST) {
        this.reconFromHere();
        this.remoteMining();
    }

    baseBuilder(this);


};

Room.prototype.rapidGuardianSpawning = function () {
    if (!Memory.rapidResponseGuardianQueue) { Memory.rapidResponseGuardianQueue = []; return }; // init queue
    if (Memory.rapidResponseGuardianQueue.length == 0) { return } // no Response required

    if (this.energyAvailable < config.rapidGuardian.minBodySize) { return }
    if (this.findMainSpawns().getRoleOfCreepSpawning() && this.findMainSpawns().getRoleOfCreepSpawning() !== Role.GUARDIAN) {
        this.findMainSpawns().Spawning.cancel()
    };

    let room = Memory.rapidResponseGuardianQueue.shift()


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
    }

    if (this.creepsInRole(Role.CARRIER) == 0
        && this.energyAvailable >= 600
        && this.storageReserve() > 0) {
        spawnCreep(Role.CARRIER, this)
    }

    if (this.creepsInRole(Role.CARRIER) == 0
        && this.creepsInRole(Role.MINER) > 0
        && this.energyAvailable >= 600) {
        spawnCreep(Role.CARRIER, this)
    }


}

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



spawnCreep = function (role, room, opt) {
    var spawn = room.findMainSpawns();
    room.log("Createing new creep, role: " + role, LogLevel.DEBUG);
    let creepSpawnData = creepLogic[role].spawnData(room, opt);
    room.log(JSON.stringify(creepSpawnData), LogLevel.ALWAYS)
    if (config.Room.Spawning.Allow) {
        spawn.spawnRequested = true;
        let r = spawn.spawnCreep(
            utils.shuffleArray(creepSpawnData.body),
            creepSpawnData.name,
            { memory: creepSpawnData.memory });
        if (r = 0) {
            room.log("Outcome = " + r + '; ' + JSON.stringify(creepSpawnData), LogLevel.INFO)
        } else {
            room.log("Outcome = " + r + '; ' + JSON.stringify(creepSpawnData), LogLevel.ERROR)
        }
        return r
    }
    
}











