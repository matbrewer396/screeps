var roleLongRangeHarvester = {

    /** @param {Creep} creep **/
    run: function (creep) {

        creep.log("roleLongRangeHarvester.run() called");

        if (creep.memory.havesting == null) {
            creep.memory.havesting = true;
        } else if (creep.carry.energy == creep.carryCapacity) {
            creep.memory.havesting = false;
            if (creep.memory.taskCompleted == null) {
                creep.memory.taskCompleted = creep.memory.taskStart - creep.ticksToLive;
            }
        } else if (creep.carry.energy == 0) {
            if (creep.taskCompleted()) { return };
            
            if (creep.memory.taskStart == null) {
                creep.memory.taskStart = null;
                creep.memory.taskStart = creep.ticksToLive;
            }
        }

        creep.log("creep.memory.havesting: " + creep.memory.havesting);

        if (creep.memory.havesting) {
            var source = Game.getObjectById(creep.memory.sourceId);
            /* Go to source
            */
            if (creep.memory.sourceRoom != creep.room.name) {
                creep.log("not in right room... moving")
                var exits = creep.room.findExitTo(creep.memory.sourceRoom);
                creep.moveTo(creep.pos.findClosestByRange(exits));
                return;
            };
            
            var source = Game.getObjectById(creep.memory.sourceId);
            creep.log("In right... heading to source " + source)
            
            var r = creep.harvest(source);
	        if (r == ERR_NOT_IN_RANGE) {
	            creep.log('harvest failed - not in range ' + r + '... Moving.')
	            creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
	        } else {
	            creep.log('harvest failed - '+ r)
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