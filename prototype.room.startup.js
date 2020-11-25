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

    baseBuilder(this);

    //this.plan();

    // console.log(this.controllerContainers())

    /* spamn creeps
    */
    let spawning = this.findMainSpawns().isBusy();
    if (this.creepsInRole(Role.WORKER) == 0 && this.energyAvailable >= 300) {
        spawnCreep(Role.WORKER, this);
    }

    if (this.creepsInRole(Role.CARRIER) == 0
        && this.creepsInRole(Role.MINER) == 0
        && this.energyAvailable >= 600) {
        spawnCreep(Role.CARRIER, this)
    }


    if (this.energyAvailable == this.energyCapacityAvailable && !spawning) {
        for (i in config.Roles) {
            let role = config.Roles[i];
            this.log("Role: " + role.roleName + '; Auto Spawn: ' + role.autoSpawn, LogLevel.DEBUG);

            if (role.autoSpawn == undefined) {
                continue;
            };

            let noOf = this.creepsInRole(role.roleName);
            this.log("Role: " + role.roleName + '; Currently have: ' + noOf, LogLevel.DEBUG);
            if (noOf < role.autoSpawn) {
                spawnCreep(role.roleName, this);
            }
        }
    } else {
        this.log("Not Spawning. IsBusy: " + spawning
            + "; energyAvailable: " + this.energyAvailable
            + "; energyAvailable: " + this.energyCapacityAvailable, LogLevel.DEBUG)
    }

    // TODO automate this
    this.addRemoteSource(new RoomPosition(34, 20, "W8N3"))
    this.addRemoteSource(new RoomPosition(30, 21, "W8N3"))
    this.addRemoteSource(new RoomPosition(4, 12, "W8N2"))
    this.addRemoteSource(new RoomPosition(21, 43, "W8N2"))
    this.addRemoteSource(new RoomPosition(43, 31, "W7N2"))
    this.addRemoteSource(new RoomPosition(23, 34, "W7N2"))
    this.addRemoteSource(new RoomPosition(41, 46, "W7N4"))
    this.addRemoteSource(new RoomPosition(12, 31, "W7N4"))
    this.addRemoteSource(new RoomPosition(7, 43, "W6N3"))
    this.addRemoteSource(new RoomPosition(28, 20, "W6N3"))


    if (this.energyAvailable == this.energyCapacityAvailable
        && !spawning
        && this.isHealthy()) {
        for (i in this.memory.remoteSources) {
            let pos = new RoomPosition(this.memory.remoteSources[i].x, this.memory.remoteSources[i].y, this.memory.remoteSources[i].roomName)
            /** create worker creep */
            let c = _(Game.creeps).filter(
                {
                    memory: {
                        role: 'harvester'
                        , remoteSource: {
                            x: pos.x,
                            y: pos.y,
                            roomName: pos.roomName
                        }
                    }
                }).value().length;
            if (c < pos.fnNoOfCreepsRequired()) {
                this.log("Creep doesnt exists for " + pos.toString(), LogLevel.DEBUG)
                let opt = {
                    Memory: { remoteSource: pos }
                }
                spawnCreep(Role.HARVESTER, this, opt)

            }

            /** create a guardian */
            if (c > 2 || c == pos.fnNoOfCreepsRequired()) {
                let g = _(Game.creeps).filter(
                    {
                        memory: {
                            role: Role.GUARDIAN
                            , guardRoom: pos.roomName
                        }
                    }).value().length;

                if (g <= 0) {
                    let opt = {
                        Memory: { guardRoom: pos.roomName }
                    }
                    spawnCreep(Role.GUARDIAN, this, opt)
                    return
                }

            }
        }
    }


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
        let r = spawn.spawnCreep(creepSpawnData.body, creepSpawnData.name, { memory: creepSpawnData.memory });
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











