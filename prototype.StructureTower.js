var params = require('params');

module.exports = function () {


    /**
     * Summary. Execute tower commands
     */
    StructureTower.prototype.run = function () {

        /* Fire
        */
        var closestHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile) {
            this.attack(closestHostile);
            return;
        }

        /* Repair
        */
        var closestDamagedStructure = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (s) => ((s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART
                                && s.hits < s.hitsMax)
                            || (s.structureType == STRUCTURE_WALL && s.hits < this.room.memory.MinWallHitPoint)
                            || (s.structureType == STRUCTURE_RAMPART && s.hits < this.room.memory.MinWallHitPoint))
        });

        if (closestDamagedStructure) {
            this.repair(closestDamagedStructure);
        }
    };

}