var roleCarrier = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if ((creep.memory.collecting == false || creep.carry.energy == creep.carryCapacity)
            && creep.carry.energy != 0) {
            var target = creep.room.getEnergyDropTarget();
            creep.memory.collecting = false;

            var r = creep.transfer(target, RESOURCE_ENERGY)
            if(r == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }   
        } else {
            creep.memory.collecting = true;
            creep.collectEnergy();
        }
	}
};

module.exports = roleCarrier;