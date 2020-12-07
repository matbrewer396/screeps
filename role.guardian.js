/**
 * Harvest resources in near by rooms
 */

var myRole = Role.GUARDIAN
var myConfig = config.Roles.filter(function (r) { return r.roleName == myRole })[0]

var roleGuardian = {
    run: function (creep) {
        //TODO if no attack part then withdraw from battle


        /** attack if can */
        if (!creep.room.isHostileOwn() && creep.seekAndAttack(false)) { return };

        if (creep.isInjured()) {
            creep.healMe()
            return
            // go to near healer
        }
        let recycleMe = false
        if (creep.memory.guardRoom == creep.room.name) { recycleMe = true }

        if (creep.room.my) { recycleMe = true }
        else {
            // if automated attack code keeps spawning creeps wait around for the next
            if (Game.time - creep.memory.lastHostileSeen > myConfig.recycleAfterNoHostile) {
                recycleMe = true;
            }
        }
        if (recycleMe) {
            creep.log("No Hostile - recycle", LogLevel.ALWAYS)
            creep.recycle()
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
        if (opt && opt.maxBodySize && opt.maxBodySize < energyAvailable) {
            energyAvailable = opt.maxBodySize
        }

        body = fnBuildBody(body, [MOVE, ATTACK, MOVE, TOUGH, MOVE, ATTACK, MOVE, TOUGH, RANGED_ATTACK, MOVE], energyAvailable);
        room.log("Spwaming new workder - " + name + ' body: ' + body.toString(), LogLevel.DEBUG);
        return { name, body, memory };

    }, noRequiredCreep: function (room) {
        return 0
    }
}



module.exports = roleGuardian;
const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'roleGuardian');