//const LogLevel = params.LogLevel;


// Room.prototype.creeps;
// Room.prototype.sources;
// Room.prototype.noOfSources;
// Room.prototype.noOfCarrier;


Room.prototype.isPrimaryRoom = function () {
    var primaryRoom;
    if (this.name == Memory.primaryRoom) {
        return (true);
    } else {
        return (false);
    }
}


Room.prototype.controllerContainers = function () {
    return this.controller.pos.getContainersRightNextTo();
    // var container = Game.getObjectById(this.memory.controllerContainers);
    
    // if (container !== null){
    //     this.log("By memory" + container, LogLevel.DETAILED);
    //     return container;
    // }
    
    // container = this.controller.pos.getContainerRightNextTo();
    // this.log("By findContainerRightNextTo" + container, LogLevel.DEBUG);
    // if (!container) {
    //     return ({id:-1});
    // } else {
    //     this.log("site: " + container, LogLevel.DEBUG);
    //     this.memory.controllerContainer = container.id;
    //     return container;
    // }
}


Room.prototype.getEnergyDropTarget = function (pos) {
    var target;
    if (pos == null || pos == undefined) {
        var targets = this.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER
                        ) && structure.store !== undefined && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });

        if (targets.length > 0) {
            target = targets[0];
        }  
    } else {
        target = pos.getEnergyDropTarget();
    }
    return target;
}

//_.sum(Game.creeps, (c) => c.memory.role == 'harvester');

/* Clear down any var used
*/
Room.prototype.cleanUp =function () {
    this.creeps = undefined;
};


function buildPath(posA, posB, room) {
    var path = posA.findPathTo(posB);
    for (var i = 0; i < path.length; i++) 
    {
        room.log("Path: " + path[i].x + ' - ' + path[i].y, LogLevel.DETAILED)
        
        // room.log(path[i].x +' - ' + path[i].y + ' ' + path[i].look()[0].terrain, LogLevel.DETAILED)
        // find site without walls
        // if (possibleSite.look()[0].terrain == "plain"){
        //     return (possibleSite);
        // }

        room.createConstructionSite(path[i].x,path[i].y, STRUCTURE_ROAD);
    }
}

Room.prototype.buildPath = function (posA,posB) {

    let path = PathFinder.search(
        posA, {
          pos: posB,
          range: 1,
        }, {
          maxRooms: 1,
          swampCost: 0,
          plainCost: 0,
        },
      );
    return path
}






Room.prototype.roomStage = function () {
    let currentStage = this.memory.currentStage;
    
    if (!this.isTaskDueToStart("roomStage")){
        if (currentStage){
            return currentStage;
        }
    }


    let stage = RoomStage.CAMP;

    let extensions = this.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_EXTENSION;
        }
    });

    var towers = this.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });

    /* OUTPOST
    */
    if (stage >= RoomStage.CAMP
        && extensions.length >= 5 
        && this.controller.level >= 2 
        && this.creepsInRole(Role.CARRIER) >= 2
        && this.creepsInRole(Role.WORKER)  >= 2 
        && this.creepsInRole(Role.MINER)  >= 2
    ){
        stage = RoomStage.OUTPOST
    }
    /* SETTLEMENT
    */
    if (stage >= RoomStage.OUTPOST
        && towers.length > 1) {
        stage = RoomStage.SETTLEMENT
    }

    this.memory.currentStage = stage;
    if (stage !== currentStage){
        this.log("New Stage: "  + stage + "; OldStage: " + currentStage, LogLevel.ALWAYS)
    }
    this.setTaskToRenew("roomStage", config.Room.Stages.ReviewEvery)
    return stage;
}

Room.prototype.isUnderAttack = function () {
    return _.sum(this.find(FIND_HOSTILE_CREEPS)) !==0 
}



// Room.prototype.hasExist = function (d) {
//     let f;
//     switch (d) {
//         case Direction.NORTH:
//             f = FIND_EXIT_TOP;
//             break;
//         case Direction.WEST:
//             f = FIND_EXIT_RIGHT;
//             break;
//         case Direction.EAST:
//             f = FIND_EXIT_LEFT;
//             break;
//         case Direction.SOUTH:
//             f = FIND_EXIT_BOTTOM;
//             break;
        
//     }
//     return (this.find(f).length > 0)


// }