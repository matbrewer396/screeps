var params = require('params');
module.exports = function () {
    Room.prototype.creeps;
    Room.prototype.sources;
    Room.prototype.noOfSources;
    Room.prototype.noOfCreeps;



    Room.prototype.startUp = function () {
        // TODO Clean up hack
        var primaryRoom;
        if (this.name == Memory.primaryRoom) {
            primaryRoom = true;
        } else {
            primaryRoom = false;
        }

        
        // Setup memory objects
        if (this.memory.roomInit == null) {
            this.newRoow();
        }
        var spawn = this.find(FIND_MY_SPAWNS)[0];
        this.memory.MinWallHitPoint = params.DEFAULT_WALL_HITPOINT;
        /* Stats
        */
        this.creeps = this.find(FIND_MY_CREEPS);

        var noOfHarvesters = _.sum(this.creeps, (c) => c.memory.role == 'harvester');
        var noOfMiners = _.sum(this.creeps, (c) => c.memory.role == 'miner');
        var noOfBuilder = _.sum(this.creeps, (c) => c.memory.role == 'builder');
        var noOfCarrier = _.sum(this.creeps, (c) => c.memory.role == 'carrier');
        this.noOfCreeps = this.creeps.length;
        var noOfCreepsRenewing = _.sum(this.creeps, (c) => c.memory.renewing == true)
        var noOfWorkers = noOfHarvesters + noOfBuilder;
        this.sources = this.find(FIND_SOURCES);
        this.noOfSources = _.sum(this.sources);

        console.log('EnergyAvailable: ' + this.energyAvailable + ' of ' + this.energyCapacityAvailable );
        console.log(this.name + ' - Creeps: ' + this.noOfCreeps + ', harvesters: ' + noOfHarvesters 
        + ', Miners: ' + noOfMiners + ', Builder ' + noOfBuilder + ', Carrier ' + noOfCarrier + ', Renwing ' + noOfCreepsRenewing);

        if (primaryRoom == false) { return };

        /* Room Settings
        */



        if (noOfMiners >= 1 && this.memory.ALLOW_HAVESTER == true) {
            this.memory.ALLOW_HAVESTER = false;
        }
        if (noOfHarvesters > 0 && this.memory.ALLOW_HAVESTER == false) {
            var harvesters = this.creeps = this.find(FIND_MY_CREEPS, {filter: (c) => {
                return c.memory.role == 'harvester';
            }})

            for (var h in harvesters){
                harvesters[h].newRole("builder");
            }
        }

        /* spamn creeps
        */
        
       if (this.energyAvailable  == this.energyCapacityAvailable) {
            MSBSpawnCreep('WORKER',noOfWorkers, this.memory.NumberOf_Min_WORKER, 'harvester', spawn, undefined)
            MSBSpawnCreep('MINER',noOfMiners, this.memory.NumberOf_Target_MINER, 'miner', spawn, undefined)
            MSBSpawnCreep('CARRIER',noOfCarrier, this.memory.NumberOf_Target_CARRIER, 'carrier', spawn, [CARRY,CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, WORK, MOVE, MOVE])
            MSBSpawnCreep('WORKER',noOfWorkers, this.memory.NumberOf_Target_WORKER, 'harvester', spawn, undefined)
        }
        




        // Set memory

    };

    function MSBSpawnCreep(creepNamePrefix, currentNoOf, noOfCreepRequired, roleName, spawn, body) {
        if ( currentNoOf < noOfCreepRequired) {
            
            if (creepNamePrefix == 'WORKER') {
                var r = spawn.createCreepWorker(creepNamePrefix,roleName);
                console.log("Spwaming new worker - " + r);
            } else if (creepNamePrefix == 'MINER') {
                var r = spawn.createCreepMiner(creepNamePrefix, roleName);
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




    Room.prototype.newRoow = function () {
        this.memory.roomInit = true;
        this.memory.ALLOW_HAVESTER = true;

        this.memory.NumberOf_Target_CARRIER = 0;
        this.memory.NumberOf_Target_MINER = 2;
        this.memory.NumberOf_Target_WORKER = 10;
        this.memory.NumberOf_Min_WORKER = 2;
        this.memory.MinWallHitPoint = params.DEFAULT_WALL_HITPOINT;
    };
  
    Room.prototype.getEnergyDropTarget = function (controller, pos) {
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

        if (controller == true && target == null) {
            target = this.controller;
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

