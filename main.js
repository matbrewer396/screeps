
require('prototype.room')();
require('prototype.StructureSpawn')();
require('prototype.creep')();
const LogLevel = {NOTHING: 0,INFO: 1, DEBUG: 2}

module.exports.loop = function () {
    console.log("start loop");
    cleanMemory();
    processRooms();
}

function processRooms() {
    for (var name in Game.rooms) {
        var room = Game.rooms[name];

        if (Memory.primaryRoom == null) {
            Memory.primaryRoom = room.name;    
            console.log('Settings primary room: ' +  room.name);
        }
        room.startUp();
        /* process creeps
        */
        for (var name in room.creeps) {
            room.creeps[name].run();
        }

        // var towers = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });
        // for (var tower in towers) {
        //     towers[tower].run();
        // }

        // room.cleanUp();


        
    }
}






function cleanMemory() {
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
}