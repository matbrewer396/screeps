var roleCarrier = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if ((creep.memory.collecting == false || creep.carry.energy == creep.carryCapacity)
            && creep.carry.energy != 0) {
            
            creep.memory.collecting = false;
            creep.dropOffEnergy();
            
        } else {
            creep.memory.collecting = true;
            creep.collectEnergy(false);
        }
	}
};

module.exports = roleCarrier;