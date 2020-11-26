/**
 * Harvest resources in near by rooms
 */

var roleGuardian = {
    run: function (creep) {
        
        /** attack if can */
        if (creep.seekAndAttack()) { return };

        if (creep.isInjured()) {
            creep.healMe()
            // go to near healer
        }


        /** Move to room to guard */
        if (creep.moveToRoom(creep.memory.guardRoom)) { 
            creep.setTask(CreepTasks.MOVING);
            return 
        };

        /** In room to guard and nothing to attack */
        

        // if in range 3
        //rangedAttack

    },
    spawnData: function (room, opt) {
        let name = getNewCreepName("GUARDIAN");
        let body = [];
        let memory = {
            role: Role.GUARDIAN,
            myRoom: room.name,
            guardRoom: opt.Memory.guardRoom
        };
        let energyAvailable = room.energyAvailable

        body = fnBuildBody(body, [MOVE, ATTACK, MOVE, TOUGH, MOVE, ATTACK, MOVE, TOUGH, RANGED_ATTACK], energyAvailable);
        room.log("Spwaming new workder - " + name + ' body: ' + body.toString(), LogLevel.DEBUG);
        return { name, body, memory };

    }, noRequiredCreep: function(room) {
        return 0
    }
}



module.exports = roleGuardian;