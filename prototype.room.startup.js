const { cond } = require('lodash');
let creepLogic = require('./roles');

Room.prototype.startUp = function () {
    this.log('startUp() is now processing. isPrimaryRoom: ' + this.isPrimaryRoom()
        + ";energyAvailable: " + this.energyAvailable
        + ";energyCapacityAvailable: " + this.energyCapacityAvailable
        , LogLevel.INFO);

    // Setup memory objects
    if (this.memory.roomInit == null) {
        this.newRoow();
    }

    //this.memory.MinWallHitPoint = params.DEFAULT_WALL_HITPOINT;
    /* Stats
    */
    // buildStats(this);


    if (this.isUnderAttack()) {
        this.log("UNDER ATTACK", LogLevel.ALWAYS);
        // console.log(this.findMainSpawns())
        // console.log(this.findMainSpawns().spawning)
        // if (this.findMainSpawns().spawning) {
        //     console.log(this.findMainSpawns().spawning)
        //     //this.findMainSpawns().spawning.cancel()
        // }

        if (this.energyAvailable >= 600) {
            let opt = {
                Memory: { guardRoom: this.name }
            }
            spawnCreep(Role.GUARDIAN, this, opt)
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

    /* spamn creeps - rapid recovery protocol  
    */
    if (this.creepsInRole(Role.WORKER) == 0 && this.energyAvailable >= 300) {
        spawnCreep(Role.WORKER, this);
    }

    if (this.creepsInRole(Role.CARRIER) == 0
        && this.energyAvailable >= 600
        && this.storage 
        && this.storage.store[RESOURCE_ENERGY] > 0 ) {
        spawnCreep(Role.CARRIER, this)
    }

    if (this.creepsInRole(Role.CARRIER) == 0
        && this.creepsInRole(Role.MINER) > 0
        && this.energyAvailable >= 600) {
        spawnCreep(Role.CARRIER, this)
    }

    /** bau spawn */
    if (!this.findMainSpawns().isBusy()) {
        for (i in config.Roles) {
            let role = config.Roles[i];
            let maxBodyCost = config.Roles[i].maxbodyCost
            if (!maxBodyCost) { maxBodyCost = this.energyCapacityAvailable }
            if (this.energyAvailable < maxBodyCost ) {
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


    if (this.roomStage() >= RoomStage.OUTPOST){ 
        this.remoteMining();
    }
    baseBuilder(this);
    this.plan()


    


    /* Near by room
    */

    // if (this.controller.level > 4 ) {
    //     if (!Memory.Queue_ReconRoom){ Memory.Queue_ReconRoom = []; }
    //     if (!Memory.Rooms){ Memory.Rooms = []; }
    //     let adjacentRooms = Game.map.describeExits(this.name);
    //     console.log(Memory.Queue_ReconRoom)
    //     for (i in adjacentRooms) {
    //         let nextRoomName = adjacentRooms[i];
    //         let nextRoom = Game.rooms[nextRoomName];
    //         if (Memory.Rooms.includes(nextRoom)){
    //             this.log("Known Room",LogLevel.ALWAYS)
    //         }
    //         console.log(nextRoomName);
    //         console.log(nextRoom);
    //         if (!Memory.Queue_ReconRoom.includes(nextRoomName)){
    //             Memory.Queue_ReconRoom.push(nextRoomName)  
    //         };

    //     }
    //     //console.log(Game.creeps.filter(function(c) { return c.memory.role == Role.RECON})
    // }


    //Memory.Queue_ReconRoom.push("end")
    // console.log(Memory.Queue_ReconRoom.includes("end"))
    // console.log(Memory.Queue_ReconRoom.includes("endboo"))

    //console.log(Memory.Queue_ReconRoom.shift())

};




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
    }
}


Room.prototype.newRoow = function () {
    this.log("new room - set memory defaults", LogLevel.ALWAYS);
    this.memory.roomInit = true;
    this.memory.ALLOW_HAVESTER = true;

    this.memory.NumberOf_Target_CARRIER = 0;
    this.memory.NumberOf_Target_MINER = 2;
    this.memory.NumberOf_Target_WORKER = 10;
    this.memory.NumberOf_Min_WORKER = 2;
    this.memory.MinWallHitPoint = params.DEFAULT_WALL_HITPOINT;
};











