﻿module.exports = function () {
    // create a new function for StructureSpawn
    StructureSpawn.prototype.createCreepWorker = function (creepNamePrefix, roleName) {
        var maxSize = this.room.energyCapacityAvailable;
        var noParts = Math.floor(maxSize / 200);
        var body = [];
        console.log(this.room.energyCapacityAvailable);
        console.log(maxSize)
        console.log(noParts)
        for (let i = 0; i < noParts; i++) {
            body.push(WORK);
            body.push(CARRY);
            body.push(MOVE);
        }
        var remainder = (maxSize - noParts * 200)
        console.log(remainder)
        noParts = Math.floor(remainder / 50)
        console.log(noParts)
        var nextPart = MOVE;

        for (let i = 0; i < noParts; i++) {
            body.push(nextPart);
                
            if (nextPart == CARRY) {
                nextPart = MOVE;
            } else {
                nextPart = CARRY;
            }

        }
        var name = this.getNameName(creepNamePrefix);
        console.log("Spwaming new workder - " + name + ' body: ' + body.toString());
        return this.createCreep(body, name, { role: roleName });
    };

    StructureSpawn.prototype.createCreepMiner = function (creepNamePrefix, roleName) {
        var maxSize = this.room.energyCapacityAvailable;
        var body = [];
        // Add move blix
        maxSize = maxSize - 50;
        body.push(MOVE);

        var noParts = Math.floor(maxSize / 100);

        // 3000 E / regen every 30
        if (noParts > 10) {
            noParts = 10
        };
        
        for (let i = 0; i < noParts; i++) {
            body.push(WORK);
        }
        var name = this.getNameName(creepNamePrefix);
        console.log("Spwaming new miner - " + name + ' body: ' + body.toString());
        return this.createCreep(body, name, { role: roleName });
    };

    /**
     * Summary. create long range harvester 
     */
    StructureSpawn.prototype.createLongRangeHarvester = function (sourceId, sourceRoom, carryPartForWork) {
        var maxSize = this.room.energyCapacityAvailable;
        var body = [];
        // force one work
        body.push(WORK);
        maxSize -= 100;

        var noParts = Math.floor(maxSize / 100);
        var addWork = 1;
        for (let i = 0; i < noParts; i++) {
            body.push(MOVE);
            body.push(CARRY);
            if (addWork >= carryPartForWork && i + 2 < noParts) {
                body.push(WORK);
                addWork = 1;
                i += 2;
            } else {
                addWork += 1;
            }
        }
        var name = this.getNameName('LONG_HARVESTER');
        console.log("Spwaming new miner - " + name + ' body: ' + body.toString());
        return this.createCreep(body, name
            , {
                role: "LongRangeHarvester",
                sourceId: sourceId,
                sourceRoom: sourceRoom
            });
    };

    /**
     * Summary. get unused name
     */
    StructureSpawn.prototype.getNameName = function (creepNamePrefix) {
        /* Get name
        */
        do {
            var name = Math.floor(Math.random() * 8999) + 1000;
            name = creepNamePrefix + '_' + name;
        } while (_.sum(this.room.creeps, (c) => c.name == name) !== 0);

        return name;
    };
};