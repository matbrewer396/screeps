

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

        var towers = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });
        for (var tower in towers) {
            towers[tower].run();
        }

        room.cleanUp();


        
    }

    longRangeTarget()
    
    
    
   /* if (this.energyAvailable == this.energyCapacityAvailable) {
        Game.spawns["Spawn1"].createLongRangeHarvester('70100773019e434', 2);
    }*/
};




function longRangeTarget() {
    //TODO: Auto pick these
    var longRangeTargets = [
        { sourceId: "70100773019e434", roomName: "W6N3", noOfCreeps: 3, carryPartForWork: 3, spawn: 'Spawn1' }, // vis swapm - only one sort
        { sourceId: "7cf80773019b1f1", roomName: "W6N3", noOfCreeps: 5, carryPartForWork: 3, spawn: 'Spawn1' },
        { sourceId: "80d207728e6597b", roomName: "W7N4", noOfCreeps: 3, carryPartForWork: 3, spawn: 'Spawn1' },
        { sourceId: "c44207728e621fc", roomName: "W7N4", noOfCreeps: 6, carryPartForWork: 3, spawn: 'Spawn1' },
    ];

    /* Process target
    */
    for (var i in longRangeTargets) {
        var target = longRangeTargets[i];
       // console.log(target.sourceId)
        var noOfCreeps = _.sum(Game.creeps, (c) => c.memory.role == 'LongRangeHarvester' && c.memory.sourceId == target.sourceId);
        console.log(noOfCreeps)

        if (noOfCreeps < target.noOfCreeps && Game.spawns[target.spawn].room.energyAvailable == Game.spawns[target.spawn].room.energyCapacityAvailable) {
            Game.spawns[target.spawn].createLongRangeHarvester(target.sourceId, target.roomName, target.carryPartForWork);
        };
    };
}