RoomPosition.prototype.getNearByPositions = function getNearByPositions(range) {
    if (!range) { range = 1 };
    var positions = [];
    let startX = this.x - range || 1;
    let startY = this.y - range || 1;
    var maxRoomPos = 49
    for (x = startX; x <= this.x + range && x < maxRoomPos; x++) {
        for (y = startY; y <= this.y + range && y < maxRoomPos; y++) {
            if (!(x == this.x && y == this.y)) {
                positions.push(new RoomPosition(x, y, this.roomName));
            }
        }
    }
    return positions;
}

RoomPosition.prototype.getNearByBuildablePositions = function getNearByBuildablePositions(range) {
    let positions = this.getNearByPositions(range);
    let openPositions = [];
    const terrain = new Room.Terrain(positions[0].roomName);
    for (i in positions) {
        let pos = positions[i];
        if (terrain.get(pos.x, pos.y) !== TERRAIN_MASK_WALL) {
            openPositions.push(pos)
        }
    };

    return openPositions;

};

RoomPosition.prototype.isPassable = function isPassable() {
    const terrain = new Room.Terrain(this.roomName);
    if (terrain.get(this.x, this.y) !== TERRAIN_MASK_WALL) {
        return true
    } else {
        return false
    }
}




RoomPosition.prototype.getContainerRightNextTo = function getContainerRightNextTo() {
    var container = this.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER);
        }
    });

    if (this.getRangeTo(container) > 1) {
        container = null;
    } else {
        return (container);
    }

    container = this.findClosestByRange(FIND_CONSTRUCTION_SITES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER);
        }
    });

    if (this.getRangeTo(container) > 1) {
        container = null;
    }
    return (container);
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

RoomPosition.prototype.getEnergyDropTarget = function (lastTarget) {
    let target;

    /** full tower if under attack */
    if (this.room().isUnderAttack()) {
        target = this.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 200));
            }
        });
        if (target) {
            return target;
        }
    } else if (!this.room().isHealthy()) {
        /* Get full up spawn get more creeps to help
        */


        target = this.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_EXTENSION
                    || structure.structureType == STRUCTURE_SPAWN

                ) && structure.store.getFreeCapacity(RESOURCE_ENERGY) >= 1
                    && lastTarget !== structure.id
                );
            }
        });
    } else {
        target = this.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return (
                    ((structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.store.getFreeCapacity(RESOURCE_ENERGY) >= 1)
                    || (structure.structureType == STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 200)
                    && lastTarget !== structure.id)
                    ;
            }
        });

        if (target) { return target; }

        if (!this.room().heathyStorageReserve()
        ) {
            target = this.room().storage
        } else {
            target = this.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (Game.rooms[this.roomName].controllerContainers().filter(function (r) { return r.id == structure.id }).length == 1 && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 50)
                        ;
                }
            });
        }



        //&& Game.rooms[this.pos.roomName].controllerContainers().filter(function (r) { return r.id == structure.id }).length == 0

    }




    if (target) { return target; }
    return this.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => {
            return (((structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_STORAGE) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 1)
                || (structure.structureType == STRUCTURE_CONTAINER && Game.rooms[this.roomName].controllerContainers().filter(function (r) { return r.id == structure.id }).length == 1
                    && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 400)
                || (structure.structureType == STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 200)
    )
                && lastTarget !== structure.id;
        }
    });

}

RoomPosition.prototype.getAdjacentPositions = function getAdjacentPositions() {
    var positions = [];

    positions.push(new RoomPosition(this.x - 1, this.y, this.roomName));
    positions.push(new RoomPosition(this.x + 1, this.y, this.roomName));
    positions.push(new RoomPosition(this.x, this.y + 1, this.roomName));
    positions.push(new RoomPosition(this.x, this.y - 1, this.roomName));
    return positions;
}

RoomPosition.prototype.room = function () {
    return Game.rooms[this.roomName]
}


RoomPosition.prototype.isNextToRoad = function () {
    let isNextToRoad = false;
    let adjacentPositions = this.getAdjacentPositions();
    for (i in adjacentPositions) {
        if (adjacentPositions[i].hasRoad()) {
            return true;
        }
    }
    return isNextToRoad;
};


RoomPosition.prototype.fnNoOfCreepsRequired = function () {
    return 2;
};





RoomPosition.prototype.getAdjacentPositionsInDirection = function getAdjacentPositionsInDirection(direction, len) {
    var positions = [];
    let pos = this;
    let x = 0;
    let y = 0;

    switch (direction) {
        case Direction.NORTH:
            y += 1; break;
        case Direction.SOUTH:
            y -= 1; break;
        case Direction.EAST:
            x += 1; break;
        case Direction.WEST:
            x -= 1; break;
    }

    while (len > 0) {
        len -= 1;
        pos = new RoomPosition(pos.x - x, pos.y - y, pos.roomName);
        if (pos.isBuildable()) {
            break;
        }
        positions.push(pos);
        if (pos.isBoarder()) {
            break;
        }
    }

    return positions;
}


RoomPosition.prototype.findClosestStorage = function () {
    this.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => {
            return ((structure.structureType == STRUCTURE_STORAGE
            ) && structure.store.getFreeCapacity(RESOURCE_ENERGY) >= 1);
        }
    });
}



RoomPosition.prototype.hasRoad = function () {
    return this.lookFor(LOOK_STRUCTURES).some((s) => s.structureType == STRUCTURE_ROAD);
};
RoomPosition.prototype.hasContainer = function () {
    return this.lookFor(LOOK_STRUCTURES).some((s) => s.structureType == STRUCTURE_CONTAINER);
};
RoomPosition.prototype.hasConstructionSite = function () {

    return this.lookFor(LOOK_CONSTRUCTION_SITES).length > 0;
};

RoomPosition.prototype.hasStructure = function () {
    return this.lookFor(LOOK_STRUCTURES).length > 0;
};

RoomPosition.prototype.toNorth = function () {
    return new RoomPosition(this.x, this.y + 1, this.roomName);
};

RoomPosition.prototype.toSouth = function () {
    return new RoomPosition(this.x, this.y - 1, this.roomName);
};

RoomPosition.prototype.toEast = function () {
    return new RoomPosition(this.x + 1, this.y, this.roomName);
};
RoomPosition.prototype.toWest = function () {
    return new RoomPosition(this.x - 1, this.y, this.roomName);
};
RoomPosition.prototype.isBuildable = function () {
    return (this.lookFor(LOOK_TERRAIN)[0] === 'wall');
};


RoomPosition.prototype.isBoarder = function (offset) {
    if (!offset) (offset = 0)

    return (this.x <= 1 + offset || this.x >= 48 - offset || this.y <= 1 + offset || this.y >= 48 - offset);
};


// RoomPosition.prototype.toString = function() {
//     return this.roomName + '-' + this.x + '-' + this.y;
// };

