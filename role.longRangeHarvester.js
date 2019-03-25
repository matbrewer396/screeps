var roleLongRangeHarvester = {

    /** @param {Creep} creep **/
    run: function (creep) {

        

        if (creep.memory.havesting == null) {
            creep.memory.havesting = true;
        } else if (creep.carry.energy == creep.carryCapacity) {
            creep.memory.havesting = false;
            if (creep.memory.taskCompleted == null) {
                creep.memory.taskCompleted = creep.memory.taskStart - creep.ticksToLive;
            }
        } else if (creep.carry.energy == 0 ) {
            creep.memory.havesting = true;
            if (creep.memory.taskStart == null) {
                creep.memory.taskStart = creep.ticksToLive;
            }
            // TODO creep.review();
        }
       // creep.move(LEFT );
        //creep.memory.sourceRoom = "W6N3";

        if (creep.memory.havesting) {
            var source = Game.getObjectById(creep.memory.sourceId);
            console.log(source);
            /* Go to source
            */
            console.log(creep.memory.sourceRoom != creep.room.name);
            console.log(creep.memory.sourceRoom +' - ' +  creep.room.name);
            if (creep.memory.sourceRoom != creep.room.name) {
                var exits = creep.room.findExitTo(creep.memory.sourceRoom);
                creep.moveTo(creep.pos.findClosestByRange(exits));
                return;
            };

            var source = Game.getObjectById(creep.memory.sourceId);
            var r = creep.harvest(source);
	        if (r == ERR_NOT_IN_RANGE) {
	            creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
	        }
        } else {
            /* Head home
            */
            
	        if (creep.goHomeRoom() == false) { return };
	        creep.dropOffEnergy(true);
        }
	}
};

module.exports = roleLongRangeHarvester;