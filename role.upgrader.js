var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (!creep.memory.upgraderContainer) {
            creep.log("No upgrader container", LogLevel.ERROR)
            assignContainer(creep);
            /** replacement creep */
            if (!creep.memory.upgraderContainer) {
                creep.moveTo(creep.room.controller)
            }
            return
        }

        var target = Game.getObjectById(creep.memory.upgraderContainer);


        if (creep.pos.getRangeTo(target) == 0) {
            creep.log("Upgrading", LogLevel.DEBUG);
            creep.setTask(CreepTasks.UPGRADE_CONTROLLER);
            var r = creep.upgradeController(creep.room.controller);
            if (r == ERR_NOT_ENOUGH_RESOURCES) {
                let withDrawOutcome = creep.withdraw(target, RESOURCE_ENERGY);

                /** hand result */
                if (withDrawOutcome == OK) {
                    creep.log("withdraw OK ", LogLevel.DEBUG)
                } else if (withDrawOutcome == ERR_NOT_ENOUGH_RESOURCES) {
                    assignContainer(creep);
                } else {
                    creep.log("Unhandled upgrader withdrwa outcome: " + withDrawOutcome, LogLevel.ERROR)
                }
            }
            creep.log("Upgraded " + r, LogLevel.DEBUG);
        } else {
            creep.log("moving", LogLevel.DEBUG);
            creep.moveTo(target)
        }
    },
    spawnData: function (room, opt) {
        let name = getNewCreepName("UPGRADER");
        let body = [];
        let memory = {
            role: Role.UPGRADER,
            myRoom: room.name,
            //upgraderContainer: opt.memory.upgraderContainer
        };

        let energyAvailable = room.energyAvailable
        body.push(CARRY)
        energyAvailable -= CreepBody.filter(function (r) { return r.Part == CARRY })[0].Cost;
        body.push(MOVE)
        energyAvailable -= CreepBody.filter(function (r) { return r.Part == MOVE })[0].Cost;
        body = fnBuildBody(body, [WORK], energyAvailable)
        room.log("Spawning new Upgrader - " + name + ' body: ' + body.toString(), LogLevel.DEBUG);
        return { name, body, memory };

    }
};


function assignContainer(creep) {
    let c = creep.room.controllerContainers().filter(
        function (c) {
            if (c.store[RESOURCE_ENERGY]> 0
                 && _.sum(Game.creeps, (creep) => creep.memory.upgraderContainer == c.id) == 0){
                return true
            }
            
        }
    )[0]
    /** move to another if possable */
    if (c) {
        creep.memory.upgraderContainer = c.id
    }
    
}

module.exports = roleUpgrader;