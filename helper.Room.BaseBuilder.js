baseBuilder = function(room) {
    // Todo loop over room.tasks
    if(room.isTaskDueToStart("roadNetwork")) { roadNetwork(room); }
    if(room.isTaskDueToStart("buildSourceContainer")) { buildSourceContainer(room); }

    
    /* Outpost task
    */
    if (room.roomStage() >= RoomStage.OUTPOST){
        if(room.isTaskDueToStart("buildControllerContainer")) { buildControllerContainer(room); }
        if(room.isTaskDueToStart("checkCreepForControllerContainer")) { checkCreepForControllerContainer(room); }
    }
}




/* Build a container for upgraded
*/
function buildControllerContainer(room) {
    let myName = "buildControllerContainer";
    let myConfig = config.Room.Tasks.filter(function (r) { return r.Function == myName })[0];
    room.log('Build Controller Container ' + room.controller, LogLevel.INFO);
    var containerSites = room.controller.pos.getNearByBuildablePositions();

    for (i in containerSites){
        let containerSite = containerSites[i];
        room.log('Build Controller Container ' + containerSite, LogLevel.DEBUG);
        //let upCreep =  _.sum(Game.creeps, (c) => c.memory.minerContrainer == container.id);
    }
    room.setTaskToRenew(myName, myConfig.ReviewEvery)
}

function checkCreepForControllerContainer(room) {
    let myName = "checkCreepForControllerContainer";
    let myConfig = config.Room.Tasks.filter(function (r) { return r.Function == myName })[0];

   // for (i in room.)



    room.setTaskToRenew(myName, myConfig.ReviewEvery)
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
        room.log('Checking source has container: ' + source, LogLevel.ALWAYS);
        
        let container = sources[i].pos.getContainerRightNextTo();
        if (container !== undefined && container !== null) {
            
            let existing = _.sum(Game.creeps, (c) => c.memory.minerContrainer == container.id);
            room.log('container has creep: ' + existing, LogLevel.ALWAYS);
            if (existing == 0 ) {
                if(room.energyAvailable == room.energyCapacityAvailable) {
                    spwanCreep (Role.MINER, room);
                } else {
                    room.setTaskToRenew(myName, myConfig.ReviewEveryOnFailure);
                    return;
                }
            }           
            room.log('Found container: ' + container, LogLevel.ALWAYS);
            continue;
        };
        var buildSite = source.pos.getNearByBuildablePositions()[0];
        //findFreePos(source.pos.x,source.pos.y,1,room);
        room.log('Found site ' + buildSite, LogLevel.INFO);
        buildSite.createConstructionSite(STRUCTURE_CONTAINER);
    }
    /** Next rewiew date */
    room.setTaskToRenew(myName, myConfig.ReviewEvery)
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
            buildRoad(source.pos, spawns[j].pos, room);
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
    room.setTaskToRenew(myName, myConfig.ReviewEvery)
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