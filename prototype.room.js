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








/* Return the container next to controller
*/
Room.prototype.controllerContainer = function () {
    var container = Game.getObjectById(this.memory.controllerContainer);
    
    if (container !== null){
        this.log("By memory" + container, LogLevel.DETAILED);
        return container;
    }
    
    container = this.controller.pos.getContainerRightNextTo();
    this.log("By findContainerRightNextTo" + container, LogLevel.DEBUG);
    if (!container) {
        return ({id:-1});
    } else {
        this.log("site: " + container, LogLevel.DEBUG);
        this.memory.controllerContainer = container.id;
        return container;
    }
}


Room.prototype.getEnergyDropTarget = function (pos) {
    var target;
    if (pos == null || pos == undefined) {
        var targets = this.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER ||
                        (structure.structureType == STRUCTURE_CONTAINER && structure.id == this.controllerContainer().id)
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

Room.prototype.creepsInRole = function (role) {
    return _.sum(this.find(FIND_MY_CREEPS), (c) => c.memory.role == role)
}




Room.prototype.roomStage = function () {
    let currentStage = this.memory.currentStage;
    
    if (!this.isTaskDueToStart("roomStage")){
        if (currentStage){
            return currentStage;
        }
    }


    let stage = RoomStage.CAMP;

    let extenstions = this.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_EXTENSION;
        }
    });

    /* Baseillys
    */
    if (stage >= RoomStage.CAMP
        && extenstions.length >= 5 
        && this.controller.level >= 2 
        && this.creepsInRole(Role.CARRIER) >= 2
        && this.creepsInRole(Role.WORKER)  >= 4 
    ){
        stage = RoomStage.OUTPOST
    }

    this.memory.currentStage = stage;
    this.log("Stage: "  + stage, LogLevel.ALWAYS)
    this.setTaskToRenew("roomStage", config.Room.Stages.RenewEvery)
    return stage;
}



