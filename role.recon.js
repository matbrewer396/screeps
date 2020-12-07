
var myRole = Role.RECON
var myConfig = config.Roles.filter(function (r) { return r.roleName == myRole })[0]
var roleRecon = {
    /** @param {Creep} creep **/
    run: function(creep) {
        /** logic to get creep to work */

        /** check if have target */
        if (!creep.memory.reconTarget) {
            
            creep.memory.reconTarget = Memory.reconRoomQueue.shift();
            creep.log("New recon target", LogLevel.DEBUG)
            if (!creep.memory.reconTarget) {
                creep.log("Nothing recycle", LogLevel.ALWAYS)
                creep.recycle()
                return
            }
        } 
        
        /** has a target */
        let reconTarget = creep.memory.reconTarget;
        creep.log("reconTarget: " + JSON.stringify(reconTarget),LogLevel.DEBUG)
        if (creep.room.name == reconTarget){
            creep.log("in target room, calling reconUpdate() " ,LogLevel.DEBUG)
            creep.room.reconUpdate();
            creep.memory.reconTarget = null;
        } else {
            creep.moveToRoom(reconTarget)
        }


    },
     /** @param {Room} room **/
    spawnData: function(room) {
        let name = getNewCreepName(myRole.toUpperCase());
        let body = [];
        let memory = {
            role: myRole,
            myRoom: room.name
        };
        let energyAvailable = room.energyAvailable
        if(myConfig.maxBodyCost) {
            if (myConfig.maxBodyCost  <= energyAvailable) {
                energyAvailable = myConfig.maxBodyCost
            }
        }

        /** Mandatory parts */
        energyAvailable = CreepBody.filter(function (r) { return r.Part == MOVE})[0].Cost;
        body.push(MOVE)
        energyAvailable = CreepBody.filter(function (r) { return r.Part == MOVE})[0].Cost;
        body.push(MOVE)
        energyAvailable = CreepBody.filter(function (r) { return r.Part == MOVE})[0].Cost;
        body.push(MOVE)
        // /** creep adding parts */        
        // body = fnBuildBody(body, [WORK],energyAvailable);
        // room.log("Spawning new " + myRole + " - " + name + ' body: ' + body.toString(),LogLevel.DEBUG);
        return {name, body, memory};
    
    },
     /** @param {Room} room **/
    noRequiredCreep: function(room) {
        if (Memory.reconRoomQueue && Memory.reconRoomQueue.length > 0 && _.filter(Game.creeps, {memory: {role: Role.RECON}} ).length == 0){
            return 1 
        } else {
            return 0
        }
        
    },
    onDeath: function(creep) {
        
    }

};
module.exports = roleRecon;
const profiler = require("screeps-profiler");
profiler.registerObject(module.exports, 'roleRecon');