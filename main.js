
require('require');
const LogLevel = {NOTHING: 0,INFO: 1, DEBUG: 2}

const profiler = require('screeps-profiler');

// This line monkey patches the global prototypes.
profiler.enable();
module.exports.loop = function() {
  profiler.wrap(function() {
    console.log("start loop");
    Game.map.visual.import(Memory.MapVisualData);
    cleanMemory();
    processRooms();
    Memory.MapVisualData = Game.map.visual.export();
  });
}


function processRooms() {
   // Memory.rapidResponseGuardianQueue = []
    for (var name in Game.rooms) {
        var room = Game.rooms[name];
        if (Memory.primaryRoom == null) {
            Memory.primaryRoom = room.name;    
            console.log('Settings primary room: ' +  room.name);
        }



        try {
            room.startUp();
        } catch (error) {
            console.log("ERROR! room.startUp();" + error.stack);
        // or log remotely
        } finally {
        // clean up
        }
        /* process creeps
        */
        for (var name in room.find(FIND_MY_CREEPS)) {
            try {
                room.find(FIND_MY_CREEPS)[name].run();
            } catch (error) {
                console.log("ERROR! creep.run(); stack:" + error.stack);
            // or log remotely
            } finally {
            // clean up
                continue
            }
            
        }

        var towers = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });
        for (var tower in towers) {
            try {
                towers[tower].run();
            } catch (error) {
                console.log("ERROR! Tower.run()" + error.stack);
            // or log remotely
            } finally {
            // clean up
            }
            
        }

        // room.cleanUp();


        
    }
}






function cleanMemory() {
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            for (var roomName in Game.rooms) {
                Game.rooms[roomName].removeCreepFromMemory(name)
            }
            Game.rooms
            
            console.log('Clearing non-existing creep memory:', name);
        }
    }
}