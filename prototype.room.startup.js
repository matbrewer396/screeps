let creepLogic = require('./roles');

Room.prototype.startUp = function () {
    this.log('startUp() is now processing. isPrimaryRoom: ' + this.isPrimaryRoom(), LogLevel.INFO);

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
    

    
    
   



   // buildSourceContainer(this);
        
//       

    //buildContainter(this);
    /* Room Settings
    */
    //
    // var noOfUpgraderRequired = 0
    // if (this.energyCapacityAvailable > 450 && !this.memory.controllerContainer) {
    //     buildControllerContainer(this);
    //     this.controllerContainer();
    //     noOfUpgraderRequired = 1; 
    // } else if (this.controllerContainer() !== null) {
    //     noOfUpgraderRequired = 1; 
    // }
    


//     if (noOfMiners >= 1 && this.memory.ALLOW_HAVESTER == true) {
//         this.memory.ALLOW_HAVESTER = false;
//     }
//     if (noOfHarvesters > 0 && this.memory.ALLOW_HAVESTER == false) {
//         var harvesters = this.creeps = this.find(FIND_MY_CREEPS, {filter: (c) => {
//             return c.memory.role == 'harvester';
//         }})

//         for (var h in harvesters){
//             harvesters[h].newRole("builder");
//         }
//     }

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
    


    
};


function spwanCreep (role, room) {
    var spawn = room.find(FIND_MY_SPAWNS)[0];
    room.log("Createing new creep, role: " + role, LogLevel.DEBUG);
    let creepSpawnData = creepLogic[role].spawnData(room);
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


// function buildStats(r) {
//     r.creeps = r.find(FIND_MY_CREEPS);

//     noOfWorkers = _.sum(r.creeps, (c) => c.memory.role == 'worker');
//     //noOfHarvesters  = _.sum(r.creeps, (c) => c.memory.role == 'harvester');
//     noOfMiners      = _.sum(r.creeps, (c) => c.memory.role == 'miner');
//     noOfUpgrader      = _.sum(r.creeps, (c) => c.memory.role == 'upgrader');
//     //noOfBuilder     = _.sum(r.creeps, (c) => c.memory.role == 'builder');
//     r.noOfCarrier     = _.sum(r.creeps, (c) => c.memory.role == 'carrier');
//     r.noOfCreeps = r.creeps.length;
//     noOfCreepsRenewing = _.sum(r.creeps, (c) => c.memory.renewing == true)
//     r.sources = r.find(FIND_SOURCES);
//     r.noOfSources = _.sum(r.sources);

//     r.log('EnergyAvailable: ' + r.energyAvailable + ' of ' + r.energyCapacityAvailable,LogLevel.INFO );
//     r.log('Creeps: ' + r.noOfCreeps + ', worker: ' + noOfWorkers + ', Miners: ' + noOfMiners + ', Carrier ' + r.noOfCarrier + ', Renewing ' + noOfCreepsRenewing, LogLevel.INFO);
// };

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


/* Build a container for upgraded
*/
function buildControllerContainer(room) {
    room.log('Build Controller Container ' + room.controller, LogLevel.INFO);
    var x = room.controller.pos.x;
    var y = room.controller.pos.y;

    var i;
    var j;
    var containerSite = findFreePos(room.controller.pos.x,room.controller.pos.y,1,room);
    
    if (containerSite !== undefined) {
        room.log('Build Controller Container ' + containerSite, LogLevel.INFO);
        room.memory.controllerContainer = containerSite.createConstructionSite(STRUCTURE_CONTAINER);
        room.log('Container id ' + room.memory.controllerContainer, LogLevel.INFO);
        } else {
        room.log('Cant find site', LogLevel.ALWAYS);
    }
}

/**
 * find sources and build where missing container
 * @param {*} room Target room
 */
function buildSourceContainer(room) {
    let myName = "buildSourceContainer";
    let myConfig = config.Room.Tasks.filter(function (r) { return r.Function == myName })[0];
    var sources = room.find(FIND_SOURCES);
    for(var i in sources){
        var source = sources[i];
        room.log('Checking source has container: ' + source, LogLevel.INFO);
        
        let container = sources[i].pos.getContainerRightNextTo();
        if (container !== undefined && container !== null) {
            
            let existing = _.sum(Game.creeps, (c) => c.memory.minerContrainer == container.id);
            if (existing == 0 ) {
                if(room.energyAvailable == room.energyCapacityAvailable) {
                    spwanCreep (Role.MINER, room);
                } else {
                    room.setTaskToRenew(myName, myConfig.RenewEveryOnFailure);
                    return;
                }
                
            }           
            room.log('Found container: ' + container, LogLevel.INFO);
            continue;
        };
        var buildSite = source.pos.getNearByBuildablePositions()[0];
        //findFreePos(source.pos.x,source.pos.y,1,room);
        room.log('Found site ' + buildSite, LogLevel.INFO);
        buildSite.createConstructionSite(STRUCTURE_CONTAINER);
    }
    /** Next rewiew date */
    room.setTaskToRenew(myName, myConfig.RenewEvery)
}

function baseBuilder(room) {
    // Todo loop over room.tasks
    if(room.isTaskDueToStart("roadNetwork")) { roadNetwork(room); }
    if(room.isTaskDueToStart("buildSourceContainer")) { buildSourceContainer(room); }
    
}





function roadNetwork(room) {
    let myName = "roadNetwork";
    let myConfig = config.Room.Tasks.filter(function (r) { return r.Function == myName })[0];
    /* all sources
    */
    var sources = room.find(FIND_SOURCES);
    for(var i in sources){
        var source = sources[i];
        buildRoad(source.pos, room.controller.pos, room)

        var spawns = room.find(FIND_MY_SPAWNS);
        for(var j in spawns){
            buildRoad(source.pos, spawns[j].pos, room)
        }
    }
    

    /** Spawn should have aroad around i */

    var spawns = room.find(FIND_MY_SPAWNS);
    for(var i in spawns){
        let positions = spawns[i].pos.getNearByPositions();
        
        for(var j in positions){
            if (!positions[j].hasRoad()){ // create road if not exists
                room.createConstructionSite(positions[j].x,positions[j].y, STRUCTURE_ROAD);
            };
        }
    }

    /** Next rewiew date */
    room.setTaskToRenew(myName, myConfig.RenewEvery)
}


function buildRoad(posA, posB, room) {
    let path = room.buildPath(posA, posB)
    room.log(path.path, LogLevel.DEBUG);
    for (var i = 0; i < path.path.length; i++) 
    {
        let pos = path.path[i];
        if (!pos.hasRoad()){ // create road if not exists
            room.createConstructionSite(pos.x,pos.y, STRUCTURE_ROAD);
        }
    }
}