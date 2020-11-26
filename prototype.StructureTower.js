StructureTower.prototype.run = function () {
    /* Fire
    */
    let closestHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
        let r = this.attack(closestHostile);
        console.log(r)
        return;
    }
    /* Repair
    */
    var closestDamagedStructure = this.pos.findInRange(FIND_STRUCTURES, 6,{
        filter: (s) => ((s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART
            && s.hits < s.hitsMax)
            || (s.structureType == STRUCTURE_WALL && s.hits < this.room.memory.MinWallHitPoint)
            || (s.structureType == STRUCTURE_RAMPART && s.hits < this.room.memory.MinWallHitPoint))
    })[0];

    if (closestDamagedStructure) {
        this.repair(closestDamagedStructure);
    }

    /* Heal
    */
    let creeps = this.room.findMyCreeps().filter(function (c) { return c.isInjured() })
    for (i in creeps) {
        this.heal(creeps[i])
    }
};