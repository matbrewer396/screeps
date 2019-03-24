module.exports = function () {
    // create a new function for StructureSpawn
    StructureSpawn.prototype.createCreepWorker = function (creepNamePrefix, roleName) {
        var maxSize = this.energyCapacityAvailable;
        var noParts = Math.floor(maxSize / 200);
        var body = [];

        for (let i = 0; i < noParts; i++) {
            body.push(WORK);
            body.push(CARRY);
            body.push(MOVE);
        }
            
        var remainder = (maxSize - noParts * 200)

        noParts = Math.floor(maxSize / 50)
        var nextPart = MOVE;
        for (let i = 0; i < noParts; i++) {
            body.push(nextPart);
                
            if (nextPart == WORK) {
                nextPart = MOVE;
            } else {
                nextPart = WORK;
            }

        }

        return this.createCreep(body, this.getNameName(creepNamePrefix), { role: roleName });
    };

    StructureSpawn.prototype.createCreepMiner = function (creepNamePrefix, roleName) {
        var maxSize = this.energyCapacityAvailable;

        maxSize -50
        body.push(MOVE);

        var noParts = Math.floor(maxSize / 100);
        var body = [];

        for (let i = 0; i < noParts; i++) {
            body.push(WORK);
            body.push(CARRY);
            body.push(MOVE);
        }

        return this.createCreep(body, this.getNameName(creepNamePrefix), { role: roleName });
    };

    StructureSpawn.prototype.getNameName = function (creepNamePrefix) {
        /* Get name
        */
        do {
            var name = Math.floor(Math.random() * 8999) + 1000;
            name = creepNamePrefix + '_' + name;
        } while (_.sum(this.room.creeps, (c) => c.name == name) !== 0);

        
    };
};