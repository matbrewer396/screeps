
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
Room.prototype.cleanUp = function () {
    this.creeps = undefined;
};


// function buildPath(posA, posB, room) {
//     var path = posA.findPathTo(posB);
//     for (var i = 0; i < path.length; i++) 
//     {
//         room.log("Path: " + path[i].x + ' - ' + path[i].y, LogLevel.DETAILED)

//         // room.log(path[i].x +' - ' + path[i].y + ' ' + path[i].look()[0].terrain, LogLevel.DETAILED)
//         // find site without walls
//         // if (possibleSite.look()[0].terrain == "plain"){
//         //     return (possibleSite);
//         // }

//         room.createConstructionSite(path[i].x,path[i].y, STRUCTURE_ROAD);
//     }
// }

Room.prototype.buildPath = function (posA, posB) {

    let path = PathFinder.search(
        posA, {
        pos: posB,
        range: 1,
    }, {
        maxRooms: 10,
        swampCost: 1,
        plainCost: 0,
        //   roomCallback: function(roomName) {
        //     console.log("hello")
        //     let room = Game.rooms[roomName];
        //     // In this example `room` will always exist, but since 
        //     // PathFinder supports searches which span multiple rooms 
        //     // you should be careful!
        //     if (!room) return;
        //     let costs = new PathFinder.CostMatrix;

        //     room.find(FIND_STRUCTURES).forEach(function(struct) {
        //       if (struct.structureType === STRUCTURE_ROAD) {
        //         // Favor roads over plain tiles
        //         costs.set(struct.pos.x, struct.pos.y, 1);
        //       } else if (struct.structureType !== STRUCTURE_CONTAINER &&
        //                  (struct.structureType !== STRUCTURE_RAMPART ||
        //                   !struct.my)) {
        //         // Can't walk through non-walkable buildings
        //         costs.set(struct.pos.x, struct.pos.y, 0xff);
        //       }
        //     });

        //     // for(var y=0; y<50; y++) {
        //     //     rows[y] = new Array(50);
        //     //     for(var x=0; x<50; x++) {
        //     //         rows[y][x] = x == 0 || y == 0 || x == 49 || y == 49 ? 11 : 2;
        //     //         //var terrainCode = register.terrainByRoom.spatial[id][y][x];
        //     //         var terrainCode = runtimeData.staticTerrainData[id][y*50+x];
        //     //         if(terrainCode & C.TERRAIN_MASK_WALL) {
        //     //             rows[y][x] = 0;
        //     //         }
        //     //         if ((terrainCode & C.TERRAIN_MASK_SWAMP) && rows[y][x] == 2) {
        //     //             rows[y][x] = 10;
        //     //         }
        //     //     }
        //     // }

        //     // // Avoid creeps in the room
        //     // room.find(FIND_CREEPS).forEach(function(creep) {
        //     //   costs.set(creep.pos.x, creep.pos.y, 0xff);
        //     // });

        //     return costs;
        //   }
    },
    );
    return path
}






Room.prototype.roomStage = function () {
    let currentStage = this.memory.currentStage;

    if (!this.isTaskDueToStart("roomStage")) {
        if (currentStage) {
            return currentStage;
        }
    }


    let stage = RoomStage.CAMP;

    let extensions = this.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_EXTENSION;
        }
    });

    var towers = this.findMyTowers();

    /* OUTPOST
    */
    if (stage >= RoomStage.CAMP
        && extensions.length >= 5
        && this.controller.level >= 2
        && this.creepsInRole(Role.CARRIER) >= 2
        && this.creepsInRole(Role.WORKER) >= 2
        && this.creepsInRole(Role.MINER) >= 2
    ) {
        stage = RoomStage.OUTPOST
    }
    /* SETTLEMENT
    */
    if (stage >= RoomStage.OUTPOST
        && towers.length > 1) {
        stage = RoomStage.SETTLEMENT
    }

    this.memory.currentStage = stage;
    if (stage !== currentStage) {
        this.log("New Stage: " + stage + "; OldStage: " + currentStage, LogLevel.ALWAYS)
    }
    this.setTaskToRenew("roomStage", config.Room.Stages.ReviewEvery)
    return stage;
}

Room.prototype.isUnderAttack = function () {
    return this.find(FIND_HOSTILE_CREEPS, {
        filter: function (s) {
            return s.hits > 0
        }
    }).length !== 0
}


Room.prototype.withDrawLimit = function () {
    return 50000
}

Room.prototype.getRangeBetweenPos = function (posA, posB) {
    if (!Memory.pathCost) {
        Memory.pathCost = [];
    }

    let exiting = Memory.pathCost.filter(function (r) { return r.posA == posA.toString() && r.posB == posB.toString() });
    if (exiting.length > 0) {
        return exiting[0].cost
    }

    let ret = PathFinder.search(posA, posB)
    let obj = { posA: posA.toString(), posB: posB.toString(), cost: ret.cost }
    Memory.pathCost.push(obj)
    return ret.cost;
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


Room.prototype.isHealthy = function () {
    if (this.creepsInRole(Role.CARRIER) < 1
        || this.creepsInRole(Role.WORKER) < 1
        || this.creepsInRole(Role.MINER) < 1) {
        return false
    } else {
        return true
    }

}

// TODO should change with room stage
Room.prototype.repairWallLess = function () {
    return 10000
}


Room.prototype.controllerContainersEnergy = function () {
    let containers = this.controllerContainers()
    let eInStore = 0;
    for (i in containers) {
        eInStore += containers[i].store[RESOURCE_ENERGY]
    }
    return eInStore;
}


Room.prototype.heathyStorageReserve = function () {
    if (this.storage){
        return this.storage.store[RESOURCE_ENERGY] > config.Room.HeathyStorageReserve[this.controller.level];
    } else {
        return true
    }
    
}

Room.prototype.storageReserve = function () {
    if (this.storage){
        return this.storage.store[RESOURCE_ENERGY];
    } else {
        return 0;
    }
}


