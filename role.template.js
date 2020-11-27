
/**
 * add creepLogic roles.js
 * add to Role in enums.js
 * 
 */

var myRole = Role.RoleName
var myConfig = config.Roles.filter(function (r) { return r.roleName == myRole })[0]
var roleRoleName = {
    /** @param {Creep} creep **/
    run: function(creep) {
        /** logic to get creep to work */


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
        /** creep adding parts */        
        body = fnBuildBody(body, [WORK],energyAvailable);
        room.log("Spawning new " + myRole + " - " + name + ' body: ' + body.toString(),LogLevel.DEBUG);
        return {name, body, memory};
    
    },
     /** @param {Room} room **/
    noRequiredCreep: function(room) {
        return 0
    }
};

module.exports = roleRoleName;