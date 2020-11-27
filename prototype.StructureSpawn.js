var spawnRequested = false;
StructureSpawn.prototype.isBusy = function (creep) {
    //** find nearby creeps that need to renew */
    if (this.pos.findInRange(FIND_MY_CREEPS, 1,
        {
            filter: function (c) {
                return (c.memory.renewing && !(creep && c.name == creep.name))
            }
        }
    ).length > 0 || this.spawning || spawnRequested
    ) {
        return true
    } else {
        return false;
    }
};



StructureSpawn.prototype.getRoleOfCreepSpawning = function() {
    if (!this.spawning) { return } // not spwaning
    let creepName = this.spawning.name
    return Memory.creeps[creepName].role

}