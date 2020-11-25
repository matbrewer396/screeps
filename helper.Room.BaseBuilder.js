baseBuilder = function (room) {
    // Todo loop over room.tasks

    if (room.isTaskDueToStart("buildSourceContainer")) { buildSourceContainer(room); }

    if (room.roomStage() >= RoomStage.CAMP && room.controller.level > 1) {
        if (room.isTaskDueToStart("roadNetwork")) { roadNetwork(room); }
    }


    /* Outpost task
    */
    // if (room.roomStage() >= RoomStage.OUTPOST){
    if (room.isTaskDueToStart("buildControllerContainer")) { buildControllerContainer(room); }
    if (room.isTaskDueToStart("checkCreepForControllerContainer")) { checkCreepForControllerContainer(room); }
    //}
}




/* Build a container for upgraded
*/
function buildControllerContainer(room) {
    let myName = "buildControllerContainer";
    let myConfig = config.Room.Tasks.filter(function (r) { return r.Function == myName })[0];
    room.log('Build Controller Container ' + room.controller, LogLevel.DEBUG);
    var containerSites = room.controller.pos.getNearByBuildablePositions();

    for (i in containerSites) {
        let containerSite = containerSites[i];
        room.log('Build Controller Container ' + containerSite, LogLevel.DEBUG);
        if (myConfig.Build) {
            containerSite.createConstructionSite(STRUCTURE_CONTAINER)
        } else {
            room.visual.circle(containerSite, {
                fill: 'transparent'
                , radius: 0.45
                , stroke: config.Planner.Visual.Container
            })
        }

        //let upCreep =  _.sum(Game.creeps, (c) => c.memory.minerContrainer == container.id);
    }
    room.setTaskToRenew(myName, myConfig.ReviewEvery)
}

function checkCreepForControllerContainer(room) {
    let myName = "checkCreepForControllerContainer";
    let myConfig = config.Room.Tasks.filter(function (r) { return r.Function == myName })[0];

    // console.log( _.sum(room.controllerContainers().store[RESOURCE_ENERGY]
    // ))

    let containers = room.controllerContainers()
    let eInStore = 0;
    for (i in containers) {
        eInStore += containers[i].store[RESOURCE_ENERGY]
    }
    
    let noRequired = Math.round(eInStore / 2200);


    if (noRequired > _.sum(room.findMyCreeps(), (c) => c.memory.role == Role.UPGRADER && c.ticksToLive > 50)) {
        console.log("creep needed; " + noRequired+ "; sum:" + _.sum(room.findMyCreeps(), (c) => c.memory.role == Role.UPGRADER && c.ticksToLive > 50))
        spawnCreep(Role.UPGRADER, room);
    }

    // let container = containers[i];

    //     let upCreep =  _.sum(Game.creeps, (c) => c.memory.upgraderContainer == container.id)
    //     //console.log(upCreep)
    //     let opt = {
    //         memory: {
    //             upgraderContainer: container.id
    //         }

    //     }
      //  spawnCreep(Role.UPGRADER, room, opt);

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
    let done = true;
    for (var i in sources) {
        var source = sources[i];
        room.log('Checking source has container: ' + source, LogLevel.DEBUG);
        let container = sources[i].pos.getContainerRightNextTo();
        room.log('container: ' + container, LogLevel.DEBUG);
        /** Check for minder  */
        if (container !== undefined && container !== null) {
            let existing = _.sum(Game.creeps, (c) => c.memory.minerContrainer == container.id);
            room.log('container has creep: ' + existing, LogLevel.DEBUG);
            if (existing == 0) {
                if (room.energyAvailable == room.energyCapacityAvailable) {
                    spawnCreep(Role.MINER, room);
                    room.setTaskToRenew(myName, myConfig.ReviewEveryOnFailure);
                } else {
                    room.setTaskToRenew(myName, myConfig.ReviewEveryOnFailure);
                    return;
                }
            }
            room.log('Found container: ' + container, LogLevel.DEBUG);
            continue; // move one
        };
        done = false;
        var buildSite = source.pos.getNearByBuildablePositions()[0];
        room.log('Found site ' + buildSite, LogLevel.DEBUG);
        let o = buildSite.createConstructionSite(STRUCTURE_CONTAINER);
        room.log('build site outcome: ' + o, LogLevel.DEBUG);
        if (o == ERR_INVALID_TARGET) { // sit already there 
            let cs = buildSite.lookFor(LOOK_CONSTRUCTION_SITES)[0];
            if (cs) {
                if (cs.structureType !== STRUCTURE_CONTAINER) {
                    room.log("Site taking by: " + JSON.stringify(cs), LogLevel.ERROR)
                }
            }
            room.setTaskToRenew(myName, myConfig.ReviewEveryOnFailure);
        }
    }
    /** Next rewiew date */
    if (done) {
        room.setTaskToRenew(myName, myConfig.ReviewEvery)
    } else {
        room.setTaskToRenew(myName, myConfig.ReviewEveryOnFailure);
    }

}


function roadNetwork(room) {
    let myName = "roadNetwork";
    let myConfig = config.Room.Tasks.filter(function (r) { return r.Function == myName })[0];
    /* all sources
    */
    var sources = room.find(FIND_SOURCES);
    for (var i in sources) {
        var source = sources[i];
        buildRoad(source.pos, room.controller.pos, room)

        var spawns = room.find(FIND_MY_SPAWNS);
        for (var j in spawns) {
            buildRoad(source.pos, spawns[j].pos, room);
        }
    }


    /** Spawn should have aroad around i */

    var spawns = room.find(FIND_MY_SPAWNS);
    for (var i in spawns) {
        let positions = spawns[i].pos.getNearByPositions();

        for (var j in positions) {
            if (!positions[j].hasRoad()) { // create road if not exists
                room.createConstructionSite(positions[j].x, positions[j].y, STRUCTURE_ROAD);
            };
        }
    }

    /** roads to rooms */
    for (i in room.memory.remoteSources) {
        let pos = new RoomPosition(room.memory.remoteSources[i].x, room.memory.remoteSources[i].y, room.memory.remoteSources[i].roomName)
        buildRoad(room.findMainSpawns().pos, pos, room)
    }

    /** Next rewiew date */
    room.setTaskToRenew(myName, myConfig.ReviewEvery)
}

function buildRoad(posA, posB, room) {
    let path = room.buildPath(posA, posB)
    room.log(path.path, LogLevel.DEBUG);
    for (var i = 0; i < path.path.length; i++) {
        let pos = path.path[i];
        if (!Game.rooms[room]) { return }
        if (!pos.hasRoad()) { // create road if not exists
            if (config.RoadNetwork.Build) {
                room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
            } else {
                room.visual.circle(pos, { fill: 'transparent', radius: 0.45, stroke: config.Planner.Visual.Road })
            }
        }
    }
}