global.Command = class Command {

    static helloWorld() {
        console.log("helloWorld");
        return;
    }

    static recycleCreep(creepName) {
        let creep = _.filter(Game.creeps, { name: creepName });
        console.log(Memory.creeps[creepName])
        console.log(JSON.stringify(creep))
        Memory.creeps[creepName].recycle = true
        Memory.creeps[creepName].tickBeforeReview = 0
        // creep.recycle()
        return console.log("Recycling " + creep);
    }

    static sendGuardian(roomName) {
        if (_(Game.creeps).filter(
            {
                memory: {
                    role: Role.GUARDIAN
                    , guardRoom: roomName
                }

            }).value().length > 0) {
            return "COMMAND RESPONSE - Guardian already on way, in " + _(Game.creeps).filter(
                {
                    memory: {
                        role: Role.GUARDIAN
                        , guardRoom: roomName
                    }
    
                })[0]
        } else if (!Memory.rapidResponseGuardianQueue.includes(roomName)) {
            Memory.rapidResponseGuardianQueue.push(roomName)
            return "COMMAND RESPONSE - Guardian ordered"
        } else {
            return "COMMAND RESPONSE - Guardian already requested"
        }

    }
}