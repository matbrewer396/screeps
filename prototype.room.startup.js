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
    
    this.roomStage();
    /* Exit if not primary
    */
    if (this.isPrimaryRoom() == false) { return };
    
    baseBuilder(this);

    /* spamn creeps
    */

    if (this.creepsInRole(Role.WORKER) == 0 && this.energyAvailable >= 300) {
        spwanCreep(Role.WORKER, this);
    }

    if (this.energyAvailable  == this.energyCapacityAvailable) {
        for (i in config.Roles){
            let role = config.Roles[i];
            this.log("Role: " + role.roleName + '; Auto Spawn: ' + role.autoSpawn, LogLevel.DEBUG);
            
            if (role.autoSpawn == undefined) {
                continue;
            };

            let noOf = this.creepsInRole(role.roleName);
            this.log("Role: " + role.roleName + '; Currently have: ' + noOf, LogLevel.DEBUG);
            if (noOf < role.autoSpawn){
                spwanCreep(role.roleName, this);
            }
        }
    }
    

    if (this.controller.level > 4 ) {
        if (!Memory.Queue_ReconRoom){ Memory.Queue_ReconRoom = []; }
        if (!Memory.Rooms){ Memory.Rooms = []; }
        let adjacentRooms = Game.map.describeExits(this.name);
        console.log(Memory.Queue_ReconRoom)
        //console.log(JSON.stringify(adjacentRooms));
        for (i in adjacentRooms) {
            let nextRoomName = adjacentRooms[i];
            let nextRoom = Game.rooms[nextRoomName];
            if (Memory.Rooms.includes(nextRoom)){
                this.log("Known Room",LogLevel.ALWAYS)
            }
            console.log(nextRoomName);
            console.log(nextRoom);
            if (!Memory.Queue_ReconRoom.includes(nextRoomName)){
                Memory.Queue_ReconRoom.push(nextRoomName)  
            };
            
        }

        //console.log(Game.creeps.filter(function(c) { return c.memory.role == Role.RECON})
        )
    }
    
    
    //Memory.Queue_ReconRoom.push("end")
    // console.log(Memory.Queue_ReconRoom.includes("end"))
    // console.log(Memory.Queue_ReconRoom.includes("endboo"))

    //console.log(Memory.Queue_ReconRoom.shift())
    
};




spwanCreep = function  (role, room, opt) {
    var spawn = room.find(FIND_MY_SPAWNS)[0];
    room.log("Createing new creep, role: " + role, LogLevel.DEBUG);
    let creepSpawnData = creepLogic[role].spawnData(room, opt);
    room.log(JSON.stringify(creepSpawnData), LogLevel.ALWAYS)
    if (config.Room.Spawning.Allow){
        let r = spawn.spawnCreep(creepSpawnData.body, creepSpawnData.name, {memory: creepSpawnData.memory});
        if( r = 0) {
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











