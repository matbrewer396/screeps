

require('prototype.creep')();
require('prototype.room')();

var params = require('params');


module.exports.loop = function () {
    
    /* Goals
        1. Uprade controller to level 2 
            a. Builder worker -- Game.spawns['Spawn1'].spawnCreep( [WORK, WORK, MOVE, CARRY], 'WORKER_001',  { memory: { role: 'harvester' } } );
            b. Build work 2 / 3 -- Game.spawns['Spawn1'].spawnCreep( [WORK, WORK, MOVE, CARRY], 'WORKER_002',  { memory: { role: 'harvester' } } );
                                -- Game.spawns['Spawn1'].spawnCreep( [WORK, WORK, MOVE, CARRY], 'WORKER_003',  { memory: { role: 'harvester' } } );
                                -- Game.spawns['Spawn1'].spawnCreep( [WORK, WORK, MOVE, CARRY], 'WORKER_004',  { memory: { role: 'harvester' } } );

                                -- Game.spawns['Spawn1'].spawnCreep( [WORK, WORK, WORK,MOVE, CARRY], 'WORKER_005',  { memory: { role: 'harvester' } } );
                                -- Game.spawns['Spawn1'].spawnCreep( [WORK, WORK, WORK,MOVE, CARRY], 'WORKER_006',  { memory: { role: 'harvester' } } );
                                -- Game.spawns['Spawn1'].spawnCreep( [WORK, WORK, WORK,MOVE, CARRY], 'WORKER_007',  { memory: { role: 'harvester' } } );
            c. Wait for level 2 controller
            d. build 2 extension   
            .                              
    */

    /*var tower = Game.getObjectById('08ba3f6a78964f6ffa0945a6');
    if(tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }

        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }*/

    var room;
     for(var name in Game.rooms) {
         //ToDo Add muitple room support
         room = Game.rooms[name];
    //console.log('Room "'+name+'" has '+Game.rooms[name].energyAvailable+' energy');
    }
    
    room.startUp();

    for(var name in room.creeps) {

        room.creeps[name].run();
    }
    room.cleanUp(); 
};




