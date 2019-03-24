var roleBuilder = require('role.builder');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {

        
	    if(creep.carry.energy < creep.carryCapacity) {
            var source;
            if (creep.memory.forceSource != null) {
                var sources = creep.room.find(FIND_SOURCES);
                source = sources[creep.memory.forceSource];
            } else {
                source = creep.pos.findClosestByRange(FIND_SOURCES);
            }
            
            
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                    }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                creep.move(LEFT);
                creep.memory.currentRole = "builder";
                creep.memory.building = true;
                roleBuilder.run(creep);
            }
        }
	}
};

module.exports = roleHarvester;