Room.prototype.plan = function () {
    var processedPos = [];
    let plannedSites = [];

    // let MySites = this.find(FIND_MY_CONSTRUCTION_SITES)
    // for (i in MySites){
    //     MySites[i].remove()
    // }


    if (this.memory.plan) {
        let rcl = this.controller.level;
        let extensionsAllowed = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][rcl] - this.findMyExtension().length
        let towersAllowed = CONTROLLER_STRUCTURES[STRUCTURE_TOWER][rcl] - this.findMyTowers().length
        let numberOfSites = this.findConstructionSites().length

        console.log(this.findConstructionSites())
        //console.log("Existing plan " +JSON.stringify(this.memory.plan))
        for (i in this.memory.plan) {
            let planedSite = this.memory.plan[i];
            let pos = new RoomPosition(planedSite.pos.x, planedSite.pos.y, this.name)



            // todo check structure is the same 
            if (pos.hasStructure()) { continue }

            if (config.Planner.ShowAll) {
                planStructure(pos, planedSite.structureType, this, planedSite.opt)
            }

            if (rcl >= 1) {
                if (planedSite.structureType == STRUCTURE_ROAD 
                    && planedSite.opt
                    //&& planedSite.opt.rcl >= rcl
                    && numberOfSites < 10
                ) {
                    planStructure(pos, planedSite.structureType, this, planedSite.opt)
                    buildSite(pos, planedSite.structureType);
                }

                // todo source container 
            }
            /** Extension */
            if (rcl >= 2) {
                if (planedSite.structureType == STRUCTURE_EXTENSION && extensionsAllowed > 0) {
                    extensionsAllowed -= 1
                    planStructure(pos, planedSite.structureType, this)
                    buildSite(pos, planedSite.structureType)
                }

            }
            if (rcl >= 3) {
                if (planedSite.structureType == STRUCTURE_TOWER && towersAllowed > 0) {
                    towersAllowed -= 1
                    planStructure(pos, planedSite.structureType, this)
                    buildSite(pos, planedSite.structureType)
                }
            }

            if (rcl >= 4) {
                if (planedSite.structureType == STRUCTURE_STORAGE) {
                    planStructure(pos, planedSite.structureType, this)
                    buildSite(pos, planedSite.structureType)
                }
            }

            /** build road around everything */
            // todo if swpam build anyways
            if (planedSite.structureType == STRUCTURE_ROAD
                // only build if there building next to it - roads dont count :)
                && pos.findInRange(FIND_STRUCTURES, 1).filter(function (c) {
                    return c.structureType !== STRUCTURE_ROAD
                })
                    .length > 0
                && numberOfSites == 0) {
                planStructure(pos, planedSite.structureType, this)
                buildSite(pos, planedSite.structureType);
                numberOfSites -= 1;
                //pos.createConstructionSite(planedSite.StructureType)
            }
        }

        function buildSite(pos, structureType) {
            numberOfSites += 1;
            let r = pos.createConstructionSite(structureType)
        }




        return
    }

    /**
     * Planner 
     * Tower and store
     * extension 
     */
    let aroundSpawn = this.findMainSpawns().pos.getNearByBuildablePositions();
    let storeSite = undefined;


    var subPosition = [];
    let highTraffic = {
        rcl: 1
    }

    /** high traffic areas - containers should have around around road*/
    var containers = this.findMyContainers();
    for (var i in containers) {
        processedPos.push(containers[i].pos, this)
    }
    for (var i in containers) {
        roadAtPositions(containers[i].pos.getNearByPositions(), this, highTraffic)
    }

    /** high traffic areas - containers should have around around road*/
    var spawns = this.find(FIND_MY_SPAWNS);
    for (var i in spawns) {
        roadAtPositions(spawns[i].pos.getNearByPositions(), this, highTraffic)
    }

    /** build container at source */
    var containerSites = this.controller.pos.getNearByBuildablePositions();
    for (i in containerSites) {
        let containerSite = containerSites[i];
        planStructure(containerSite, STRUCTURE_CONTAINER, this);
        roadAtPositions(containerSite.getNearByPositions(), this)
    }

    //let upCreep =  _.sum(Game.creeps, (c) => c.memory.minerContrainer == container.id);


    var sources = this.find(FIND_SOURCES);
    for (var i in sources) {
        buildRoad(sources[i].pos, this.controller.pos, this, highTraffic)
    }

    let cross = [];
    /** Build a cross from the spawn */
    if (config.Planner.BuildCross.Enabled) {
        cross = cross.concat(this.findMainSpawns().pos.getAdjacentPositionsInDirection(Direction.NORTH, config.Planner.BuildCross.RoadLength)
            .filter(function (n) { return processedPos.filter(function (p) { return p.x == n.x && p.y == n.y }).length == 0 }))
        cross = cross.concat(this.findMainSpawns().pos.getAdjacentPositionsInDirection(Direction.SOUTH, config.Planner.BuildCross.RoadLength)
            .filter(function (n) { return processedPos.filter(function (p) { return p.x == n.x && p.y == n.y }).length == 0 }))
        cross = cross.concat(this.findMainSpawns().pos.getAdjacentPositionsInDirection(Direction.WEST, config.Planner.BuildCross.RoadLength)
            .filter(function (n) { return processedPos.filter(function (p) { return p.x == n.x && p.y == n.y }).length == 0 }))
        cross = cross.concat(this.findMainSpawns().pos.getAdjacentPositionsInDirection(Direction.EAST, config.Planner.BuildCross.RoadLength)
            .filter(function (n) { return processedPos.filter(function (p) { return p.x == n.x && p.y == n.y }).length == 0 }))

        roadAtPositions(cross, this)
    }


    //let takenPos = processedPos

    var sites = cross;
    let noOfTower = 0;
    let noOfExtension = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][8];
    let lastNoOfExtension = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][8];


    while (sites.length > 0 && noOfExtension > 0) {
        let pos = sites.shift();
        let freePos = pos.getNearByBuildablePositions().filter(
            function (n) {
                return processedPos.filter(
                    function (p) { return p.x == n.x && p.y == n.y }
                ).length == 0
            }
        )
        for (j in freePos) {
            processPosition(freePos[j], this)
        }

        if (noOfExtension !== lastNoOfExtension) {
            lastNoOfExtension = noOfExtension
            /** Room CL 3, 5 */
            if (noOfExtension == 30 || noOfExtension == 20) {
                noOfTower = +1
            }
            if (noOfExtension == 10 || noOfExtension == 5 || noOfExtension == 2) {
                noOfTower = +1
            }

        }
    }
    console.log("new plan - " + JSON.stringify(plannedSites))
    this.memory.plan = plannedSites;
    //console.log(JSON.stringify(plannedSites))


    function processPosition(pos, room) {
        /** Remove any site taken
        */
        if (pos.isBoarder(3) || !pos.isPassable()) {
            return
        }

        if (processedPos.filter(function (p) { return p.x == pos.x && p.y == pos.y }).length > 0) {
            return
        }
        let StructureType;

        if (noOfTower > 0) {
            noOfTower -= 1
            towerSite = pos;
            roadAtPositions(pos.getNearByBuildablePositions(), room)
            StructureType = STRUCTURE_TOWER;
        } else if (!storeSite) {
            storeSite = pos;
            roadAtPositions(pos.getNearByBuildablePositions(), room)
            StructureType = STRUCTURE_STORAGE;
        } else if (noOfExtension > 0) {
            noOfExtension -= 1
            roadAtPositions(pos.getAdjacentPositions(), room)
            StructureType = STRUCTURE_EXTENSION;
        } else {
            return
        }
        sites = sites.concat(pos.getNearByBuildablePositions(2))
        planStructure(pos, StructureType, room);
    }

    function buildRoad(posA, posB, room, opt) {
        let path = room.buildPath(posA, posB)
        room.log(path.path, LogLevel.DEBUG);
        roadAtPositions(path.path, room, opt)
    }

    function roadAtPositions(positions, room, opt) {
        for (i in positions) {
            let pos = positions[i]
            if (!pos.isPassable()) { continue }
            if (processedPos.filter(function (p) { return p.x == pos.x && p.y == pos.y }).length > 0) {
                continue;
            }
            planStructure(pos, STRUCTURE_ROAD, room, opt);
            //processPositions(pos.getNearByBuildablePositions(), room, 1 )
        }
    }


    function planStructure(pos, StructureType, room, opt) {
        processedPos.push(pos)
        let lineStyle;
        if (opt && opt.rcl == 1) {
            lineStyle = "dashed"
        }
        room.visual.circle(pos, { fill: 'transparent', lineStyle: lineStyle, radius: 0.45, stroke: config.Planner.Visual[StructureType] })
        let planSite = {
            pos: pos,
            structureType: StructureType,
            opt: opt
        }

        plannedSites.push(planSite)
        //containerSite.createConstructionSite(StructureType)
    }

}


Room.prototype.posHasPlan = function (newPos) {
    return this.memory.plan.filter(
        function (planedSite) {
            return planedSite.pos.x == newPos.x && planedSite.pos.y == newPos.y 
        }).length > 0
}

Room.prototype.posGetPlan = function (newPos) {
    return this.memory.plan.filter(
        function (planedSite) {
            return planedSite.pos.x == newPos.x && planedSite.pos.y == newPos.y 
        })[0]
}

Room.prototype.addRoadToPlan = function (newPos) {
    if (this.posHasPlan(newPos)){ 

        if (this.memory.plan.filter(
            function (planedSite) {
                return planedSite.pos.x == newPos.x && planedSite.pos.y == newPos.y 
            })[0].structureType == STRUCTURE_ROAD) {
                this.memory.plan.filter(
                    function (planedSite) {
                        return planedSite.pos.x == newPos.x && planedSite.pos.y == newPos.y 
                    })[0].opt = {rcl: 4}
            }


        return 

    };
    if (newPos.isBoarder(-1)) {return}
    let planSite = {
        pos: newPos,
        structureType: STRUCTURE_ROAD,
        opt: {
            rcl: 4
        },
    }
    this.memory.plan.push(planSite)
    return 
}