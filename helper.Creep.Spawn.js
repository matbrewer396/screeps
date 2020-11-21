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

    while (energyAvailable >= minCost) {
        for (i in AddParts){
            let partCode = CreepBody.filter(function (r) { return r.Part == AddParts[i] })[0].Cost

            if (energyAvailable >= partCode){
                energyAvailable -= partCode;
                Body.push(AddParts[i])
            }
            
        }
    }

    return Body

}