var params = require('params');
const LogLevel = params.LogLevel;
const Role = params.Role;
module.exports = function () {
    Room.prototype.creeps;
    Room.prototype.sources;
    Room.prototype.noOfSources;
    Room.prototype.noOfCreeps;
    Room.prototype.noOfCarrier;
    

    Room.prototype.isPrimaryRoom = function () {
        var primaryRoom;
        if (this.name == Memory.primaryRoom) {
            return (true);
        } else {
            return (false);
        }
    }

    Room.prototype.log = function (msg, LogLevel) {
        if (params.LOG_ROOM_LEVEL >= LogLevel) {
            console.log("Room:" + this.name + "; Msg: " + msg);
        }
    }

    // TDOO: Add minder containter

    // function buildContainter(r) {
    //     var sources = r.find(FIND_SOURCES);
    //     for(var source in sources){
    //         r.log('processing' + sources[source], LogLevel.INFO) 
    //     }
    // }

     function findFreePos(x,y,range, room) {
        var foundFreePos
        var possibleSite
        for (i = -1; i < 2; i++) {
            for (j = -1; j < 2; j++) {
                var cX = x+i;
                var cY = y+j;
                possibleSite = room.getPositionAt(cX,cY);
                room.log(cX +' - ' + cY + ' ' + possibleSite.look()[0].terrain, LogLevel.DEBUG)
                // find site without walls
                if (possibleSite.look()[0].terrain == "plain"){
                    return (possibleSite);
                }
            }
        }
        return null;
     }

     function buildControllerContainer(room) {
        room.log('Build Controller Pad ' + room.controller, LogLevel.INFO);
        var x = room.controller.pos.x;
        var y = room.controller.pos.y;

        var i;
        var j;
        var padSite = findFreePos(oom.controller.pos.x,room.controller.pos.y,1,room);
        
        if (padSiteFound) {
            room.log('Build Controller Pad ' + padSite, LogLevel.INFO);
            room.memory.controllerPad = padSite.createConstructionSite(STRUCTURE_CONTAINER);
            room.log('Pad id ' + room.memory.controllerPad, LogLevel.INFO);
         } else {
            room.log('Cant find site', LogLevel.ALWAYS);
        }
    }

    Room.prototype.startUp = function () {
        this.log('startUp() is now processing. isPrimaryRoom: ' + this.isPrimaryRoom(), LogLevel.INFO);
        
        // Setup memory objects
        if (this.memory.roomInit == null) {
            this.newRoow();
        }
        var spawn = this.find(FIND_MY_SPAWNS)[0];
        //this.memory.MinWallHitPoint = params.DEFAULT_WALL_HITPOINT;
        /* Stats
        */
        buildStats(this);
        /* Exit if not primary
        */
        if (this.isPrimaryRoom() == false) { return };
        //buildContainter(this);
        /* Room Settings
        */
        //
        if (this.energyCapacityAvailable > 450 && !this.memory.controllerPad) {
            buildControllerContainer(this);
            this.controllerContainer();
        }
        


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
        //this.memory.NumberOf_Target_CARRIER
       if (this.energyAvailable  == this.energyCapacityAvailable) {
            MSBSpawnCreep('WORKER',noOfWorkers, this.memory.NumberOf_Min_WORKER, 'worker', spawn, undefined)
            MSBSpawnCreep('MINER',noOfMiners, this.memory.NumberOf_Target_MINER, 'miner', spawn, undefined, this)
            MSBSpawnCreep('CARRIER',this.noOfCarrier, 1, 'carrier', spawn, undefined)
            // MSBSpawnCreep('WORKER',noOfWorkers, this.memory.NumberOf_Target_WORKER, 'harvester', spawn, undefined)
        }

        if (noOfWorkers == 0 && this.energyAvailable >= 300) {
            MSBSpawnCreep('WORKER',noOfWorkers, this.memory.NumberOf_Min_WORKER, 'worker', spawn, undefined);
        }

        if (noOfMiners == 0 && this.energyAvailable >= 300) {
            MSBSpawnCreep('MINER',noOfMiners, this.memory.NumberOf_Target_MINER, 'miner', spawn, undefined, this);
        }
    };

    //var noOfHarvesters  
    var noOfMiners      
    //var noOfBuilder     
    var noOfCreepsRenewing
    //var noOfCreepsRenewing
    var noOfWorkers

    function buildStats(r) {
        r.creeps = r.find(FIND_MY_CREEPS);

        noOfWorkers = _.sum(r.creeps, (c) => c.memory.role == 'worker');
        //noOfHarvesters  = _.sum(r.creeps, (c) => c.memory.role == 'harvester');
        noOfMiners      = _.sum(r.creeps, (c) => c.memory.role == 'miner');
        //noOfBuilder     = _.sum(r.creeps, (c) => c.memory.role == 'builder');
        r.noOfCarrier     = _.sum(r.creeps, (c) => c.memory.role == 'carrier');
        r.noOfCreeps = r.creeps.length;
        noOfCreepsRenewing = _.sum(r.creeps, (c) => c.memory.renewing == true)
        r.sources = r.find(FIND_SOURCES);
        r.noOfSources = _.sum(r.sources);

        r.log('EnergyAvailable: ' + r.energyAvailable + ' of ' + r.energyCapacityAvailable,LogLevel.INFO );
        r.log('Creeps: ' + r.noOfCreeps + ', worker: ' + noOfWorkers + ', Miners: ' + noOfMiners + ', Carrier ' + r.noOfCarrier + ', Renewing ' + noOfCreepsRenewing, LogLevel.INFO);
    };

    function MSBSpawnCreep(creepNamePrefix, currentNoOf, noOfCreepRequired, roleName, spawn, body, r) {
        if ( currentNoOf < noOfCreepRequired) {
            
            if (creepNamePrefix == 'WORKER') {
                var r = spawn.createCreepWorker(creepNamePrefix,roleName);
                console.log("Spwaming new worker - " + r);
            } else if (creepNamePrefix == 'MINER') {
                var r = spawn.createCreepMiner(creepNamePrefix, roleName);
                console.log("Spwaming new miner - " + r);
            } else if (creepNamePrefix == 'CARRIER') {
                var r = spawn.createCarrier(creepNamePrefix, roleName);
                console.log("Spwaming new miner - " + r);
            } else if (body !== null) {
                console.log(creepNamePrefix)
                console.log(body)
                var name = spawn.getNameName(creepNamePrefix);
                console.log("Spwaming new creep - " + name)
                console.log(spawn.spawnCreep(body, name, { memory: { role: roleName } }));
            }
        }
    };


    /* Return the container next to controller
    */
    Room.prototype.controllerContainer = function () {
        var container


        var container = this.controller.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER );
            }
        });

        if (this.controller.pos.getRangeTo(container) > 1){
            container = null;
        }

        var container = this.controller.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER );
            }
        });

        if (this.controller.pos.getRangeTo(container) > 1){
            container = null;
        }
        if (!container) {
            return null;
        } else {
            this.log("site: " + container, LogLevel.DEBUG);
            this.memory.controllerPad = container.id;
            return container;
        }
    }
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
  
    Room.prototype.getEnergyDropTarget = function (pos) {
        var target;
        if (pos == null) {
            var targets = this.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                }
            });

            if (targets.length > 0) {
                target = targets[0];
            }  
        } else {
            target = pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity
                            ||( structure.structureType == STRUCTURE_TOWER  && (structure.energyCapacity - structure.energy) > 200 ) ;
                }
            });
        }

        return target;
    }

    //_.sum(Game.creeps, (c) => c.memory.role == 'harvester');

    /* Clear down any var used
    */
    Room.prototype.cleanUp =function () {
        this.creeps = undefined;
    };
}