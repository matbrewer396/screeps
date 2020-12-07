getNewCreepName = function (prefix) {
    /* Get name
    */
    do {
        var name = Math.floor(Math.random() * 8999) + 1000;
        name = prefix + '_' + name;
    } while (_.sum(this.creeps, (c) => c.name == name) !== 0);

    return name;
};


fnBuildBody = function (Body, AddParts, energyAvailable) {
    let minCost = 10000;
    /** Find min part code */
    for (i in AddParts){
        let partCode = CreepBody.filter(function (r) { return r.Part == AddParts[i] })[0].Cost
        if (partCode < minCost) {
            minCost = partCode;
        }
    }

    while (energyAvailable >= minCost && Body.length < 50) {
        for (i in AddParts){
            if (Body.length == 50) { break }
            let partCode = CreepBody.filter(function (r) { return r.Part == AddParts[i] })[0].Cost

            if (energyAvailable >= partCode){
                energyAvailable -= partCode;
                Body.push(AddParts[i])
            }
            
        }
    }
    return Body

}

let creepLogic = require('./roles');
spawnCreep = function (role, room, opt) {
    var spawn = room.findMainSpawns();
    room.log("Createing new creep, role: " + role, LogLevel.DEBUG);
    let creepSpawnData = creepLogic[role].spawnData(room, opt);
    room.log(JSON.stringify(creepSpawnData), LogLevel.ALWAYS)
    if (config.Room.Spawning.Allow) {
        room.memory.spawnsBusy.push(spawn.name)
        let r = spawn.spawnCreep(
            utils.shuffleArray(creepSpawnData.body).sort(function(a, b) {
                if (a == b) {
                    return 0
                } else if (a == TOUGH){
                    return -1
                } else if (b == HEAL ) {
                    return 1
                } else if (b == MOVE ) {
                    return 1
                } else {
                    return 0
                }
            }),
            creepSpawnData.name,
            { memory: creepSpawnData.memory });

        if (r == OK) {
            room.log("Succuss Outcome = " + r + '; ' + JSON.stringify(creepSpawnData), LogLevel.INFO)
        } else {
            room.log("Outcome = " + r + '; ' + JSON.stringify(creepSpawnData), LogLevel.ERROR)
        }
        return r
    }
    
}
