

require('prototype.creep')();
require('prototype.room')();
require('prototype.StructureSpawn')();
require('prototype.StructureTower')();

var params = require('params');


module.exports.loop = function () {
    

    /* Clean up memory
    */
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    /*
    */
    var room;
    for(var name in Game.rooms) {
         //ToDo Add muitple room support
         room = Game.rooms[name];
         if (Memory.primaryRoom == null) {
            Memory.primaryRoom = room.name;    
            console.log('Settings primary room: ' +  room.name);
        }
    }
    
    room.startUp();

    for(var name in room.creeps) {
        room.creeps[name].run();
    }

    var towers = room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
    for (var tower in towers) {
        towers[tower].run();
    }

    room.cleanUp(); 
};




