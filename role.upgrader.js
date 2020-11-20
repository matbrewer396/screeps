var params = require('params');
const LogLevel = params.LogLevel;
const Tasks = params.CreepTasks;
var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var target = creep.room.controllerContainer();
        if(creep.pos.getRangeTo(target ) == 0) {
            creep.log("Upgrading", LogLevel.DEBUG);
            creep.setTask(Tasks.UPGRADE_CONTROLLER);
            var r = creep.upgradeController(creep.room.controller);
            if (r == ERR_NOT_ENOUGH_RESOURCES) {
                creep.withdraw(target,RESOURCE_ENERGY);
            }
            creep.log("Upgraded " + r, LogLevel.DEBUG);
            
        } else {
            creep.log("moving", LogLevel.DEBUG);
            creep.moveTo(target)
        }
    }
};


module.exports = roleUpgrader;