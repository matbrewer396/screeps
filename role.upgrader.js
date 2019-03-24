var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.carry.energy == 0) {
            creep.memory.havesting = true;
            creep.memory.currentRole = creep.memory.role; // Reset to primary role
        }


        if (creep.memory.havesting) {
            creep.memory.task = "Upgader - Collect E";
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[1]);
            }
            if(creep.carry.energy == creep.carryCapacity) {
                creep.memory.havesting = false;
            }
        }
        else {
            creep.memory.task = "Upgader - dropp off E";
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
	}
};

module.exports = roleUpgrader;