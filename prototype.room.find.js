Room.prototype.creepsInRole = function (role) {
    return _.sum(this.findMyCreeps(), (c) => c.memory.role == role)
}

Room.prototype.findMyCreeps = function (role) {
    return this.find(FIND_MY_CREEPS)
}

Room.prototype.findSources = function (role) {
    return this.find(FIND_SOURCES)
}


Room.prototype.findMainSpawns = function () {
    return this.find(FIND_MY_SPAWNS)[0];
}

Room.prototype.findSpawns = function () {
    return this.find(FIND_MY_SPAWNS)
}

Room.prototype.findFreeSpawns = function (creep, dontCheckForCreepInRange) {
    return this.find(FIND_MY_SPAWNS).filter(function(s){
        return s.isBusy(creep, dontCheckForCreepInRange) == false})
}


Room.prototype.findUpgradeControllerWithSpace = function (creep) {
    return this.controllerContainers().filter(
        function (c) {
            if (c.store.getFreeCapacity(RESOURCE_ENERGY) > 200){
                return true
            }
            
        }
    )
}

Room.prototype.findMyTowers = function () {
    return this.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } })
}

Room.prototype.findMyContainers = function () {
    return this.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_CONTAINER } })
}
Room.prototype.findMyExtension = function () {
    return this.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_EXTENSION } })
}

Room.prototype.findKeeperLair = function () {
    return this.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_KEEPER_LAIR } })
}



Room.prototype.findConstructionSites = function () {
    return this.find(FIND_CONSTRUCTION_SITES)
}




//, { filter: { structureType: STRUCTURE_CONTAINER } }

// Room.prototype.findEmptyControllerContainer = function () {
//     return this.find(FIND_MY_STRUCTURES
//         , {
//             filter: (structure) => {
//                 return (structure.structureType == STRUCTURE_CONTAINER
//                     //&& this.controllerContainers().filter(function (r) { return r.id == structure.id }).length == 1
//                     //  && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 400
//                 )
//             }
//         }
//     );
// }




// Room.prototype.findStorage = function () {
//     return this.find(FIND_MY_STRUCTURES, {
//         filter: (structure) => {
//             return (structure.structureType == STRUCTURE_STORAGE)
//         }
//     })[0];
// }