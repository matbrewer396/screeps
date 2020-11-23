var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var target = this.memory.upgraderContainer;


        if(creep.pos.getRangeTo(target ) == 0) {
            creep.log("Upgrading", LogLevel.DEBUG);
            creep.setTask(CreepsTasks.UPGRADE_CONTROLLER);
            var r = creep.upgradeController(creep.room.controller);
            if (r == ERR_NOT_ENOUGH_RESOURCES) {
                creep.withdraw(target,RESOURCE_ENERGY);
            }
            creep.log("Upgraded " + r, LogLevel.DEBUG);
            
        } else {
            creep.log("moving", LogLevel.DEBUG);
            creep.moveTo(target)
        }
    },
    spawnData: function(room, opt) {
        let name = getNewCreepName("UPGRADER");
        let body = [];
        let memory = {
            role: Role.WORKER,
            myRoom: room.name
        };

        let energyAvailable = room.energyAvailable
        body.push(CARRY)
        energyAvailable -= CreepBody.filter(function (r) { return r.Part ==CARRY})[0].Cost;
        body.push(MOVE)
        energyAvailable -= CreepBody.filter(function (r) { return r.Part ==MOVE})[0].Cost;
        body = fnBuildBody(body, [WORK],energyAvailable)
        room.log("Spawning new Upgrader - " + name + ' body: ' + body.toString(),LogLevel.DEBUG);
        return {name, body, memory};
    
    }
};


module.exports = roleUpgrader;