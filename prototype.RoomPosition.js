RoomPosition.prototype.getNearByPositions = function getNearByPositions() {
    var positions = [];
    let startX = this.x - 1 || 1;
    let startY = this.y - 1 || 1;
    var maxRoomPos = 49
    for (x = startX; x <= this.x +1 && x < maxRoomPos; x++ ) {
        for (y = startY; y <= this.y +1 && y < maxRoomPos; y++ ) {
            if (!( x == this.x && y == this.y) ) {
                positions.push(new RoomPosition(x,y, this.roomName));
            }
        }
    }
    return positions;
}

RoomPosition.prototype.getNearByBuildablePositions = function getNearByBuildablePositions() {
    let positions = this.getNearByPositions();
    let openPositions = [];
    const terrain = new Room.Terrain(positions[0].roomName);
    for (i in positions){
        let pos = positions[i];
        if (terrain.get(pos.x,pos.y) !== TERRAIN_MASK_WALL) {
            openPositions.push(pos)
        }
    };

    return openPositions;

};

RoomPosition.prototype.getContainerRightNextTo = function getContainerRightNextTo() {
    var container = this.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER );
        }
    });
    
    if (this.getRangeTo(container) > 1){
        container = null;
    } else {
        return(container);
    }

    container = this.findClosestByRange(FIND_CONSTRUCTION_SITES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER );
        }
    });

    if (this.getRangeTo(container) > 1){
        container = null;
    }
    return(container);
};

RoomPosition.prototype.getContainersRightNextTo = function getContainersRightNextTo() {
    let nearBy = this.getNearByPositions();
    let containers = [];
    for (i in nearBy) {
        if (nearBy[i].hasContainer()) {
            containers.push(nearBy[i].look().filter(function (r) { 
                return r.type == "structure" && r.structure.structureType == STRUCTURE_CONTAINER
            })[0].structure);
        }
    }

    return containers
}

RoomPosition.prototype.getEnergyDropTarget = function () {
    let target;

    if (this.room().isUnderAttack){
        target = this.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return (( structure.structureType == STRUCTURE_TOWER  && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 200 )) ;
            }
        });
        if (target){
            return target;
        }
    }
    
    if (this.room().creepsInRole[Role.WORKER] < 3) {
        /* Get full up spawn get more creeps to help
        */
        target = this.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN ) && structure.store.getFreeCapacity(RESOURCE_ENERGY) >= 1)
                        ||( structure.structureType == STRUCTURE_TOWER  && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 200 ) ;
            }
        });
    } else {
        target = this.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_EXTENSION 
                        || structure.structureType == STRUCTURE_SPAWN 
                        
                        ) && structure.store.getFreeCapacity(RESOURCE_ENERGY) >= 1);
            }
        });

        if (!target){
            target = this.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_STORAGE 
                            ) && structure.store.getFreeCapacity(RESOURCE_ENERGY) >= 1);
                }
            });
        }
        
    }
    
    



    if (target) {
        return target;
    }
    return this.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN ) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 1)
                        || (structure.structureType == STRUCTURE_CONTAINER 
                            && Game.rooms[this.roomName].controllerContainers().filter(function (r) { return r.id == structure.id}).length == 1
                            && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 400 )
                        ||( structure.structureType == STRUCTURE_TOWER  && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 200 ) ;
            }
        });

}

RoomPosition.prototype.room = function() {
    return Game.rooms[this.roomName]
}



RoomPosition.prototype.hasRoad = function() {
    return this.lookFor(LOOK_STRUCTURES).some((s) => s.structureType == STRUCTURE_ROAD);
};
RoomPosition.prototype.hasContainer = function() {
    return this.lookFor(LOOK_STRUCTURES).some((s) => s.structureType == STRUCTURE_CONTAINER);
};

