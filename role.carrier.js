var roleCarrier = {

    /** @param {Creep} creep **/
    run: function (creep) {

        if (creep.carry.energy == 0) {
            if (creep.taskCompleted()) { return };
            creep.memory.collecting = true;
        }

        if ((creep.memory.collecting == false || creep.carry.energy == creep.carryCapacity)
            && creep.carry.energy != 0) {
            creep.memory.collecting = false;
            if (creep.dropOffEnergy(false, creep)) { return };
            /* move to holding pos
            */ 
            if (creep.carry.energy == creep.carryCapacity) { // must be full
                var spawn = creep.room.find(FIND_MY_SPAWNS)[0];
                creep.moveTo(spawn)
            } else { 
                if (creep.taskCompleted()) { return };
                creep.memory.collecting = true;
            }
            
        } else {
            creep.collectEnergy(false);
        }
	}
};

module.exports = roleCarrier;