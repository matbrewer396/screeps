var params = require('params');
var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
		
		
		// Get Resoruces
        if ((creep.memory.building && creep.carry.energy == 0) || !creep.memory.building) {
            creep.memory.task = "Builder - Collect E";
			creep.memory.currentRole = creep.memory.role; // Reset to primary role
			creep.memory.building = false;
			creep.collectEnergy(true);
		} 
		
		// Read to Build
		if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
			creep.say('🚧 build');
			creep.memory.task = "Read to Build";
			creep.memory.useSource = undefined;
		}


	    if(creep.memory.building) {
	        creep.memory.task = "Builder - Drop off";
	        if (creep.dropOffEnergy(false, creep.pos)) { return };

	        if ((creep.memory.repairer == true  || _.sum(this.creeps, (c) => c.memory.repairer == true) < 2)
	            && params.ALLOW_REPAIER_CREEPS ) {
				var structureToRepair = creep.pos.findClosestByPath(FIND_STRUCTURES, {
					filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL
				});
	
				if (structureToRepair !== null) {
					creep.memory.repairer = true;
					console.log(creep.name + ' reparing ' + structureToRepair);
					if (creep.repair(structureToRepair) == ERR_NOT_IN_RANGE) {
						creep.moveTo(structureToRepair);
					};
					return;
				} else {
					creep.memory.repairer = false;
				};
	        } else {
	            creep.memory.repairer = false;
	        };
			

	        var target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
				filter: (structure) => { 
					return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) }
			});

			if(!target) { 
				var target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
			}


			if(!target) { 
				console.log("Nothing to build")
			}

            if(target) {
				creep.memory.task = "Building";
                if(creep.build(target) == ERR_NOT_IN_RANGE) {
					creep.memory.task = "heading to target";
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
			} else if ((creep.carry.energy < creep.carryCapacity * 0.4)) {
				// goto nears sources
				creep.say('Refilling');
				var sources = creep.room.find(FIND_SOURCES);
				if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
					creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
				}
			} else {
				creep.say('upgrader');
			//	creep.moveTo(31,10, {visualizePathStyle: {stroke: '#ffaa00'}});
				creep.memory.currentRole = "upgrader";
				creep.memory.havesting = false;
			}
			

	    }
	    
		
	}
};

module.exports = roleBuilder;