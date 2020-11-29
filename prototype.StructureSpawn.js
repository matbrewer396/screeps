var spawnRequested = false;
var renewRequested = false;
StructureSpawn.prototype.isBusy = function (creep,dontCheckForCreepInRange) {
    //** find nearby creeps that need to renew */
    if ( this.spawning || spawnRequested || renewRequested
    ) {
        return true
    } else {
        if(!dontCheckForCreepInRange && this.pos.findInRange(FIND_MY_CREEPS, 1,
            {
                filter: function (c) {
                    return (c.memory.renewing && !(creep && c.name == creep.name))
                }
            }
        ).length > 0) {
            return true
        }
        
        return false;
    }
};



StructureSpawn.prototype.getRoleOfCreepSpawning = function() {
    if (!this.spawning) { return } // not spwaning
    let creepName = this.spawning.name
    return Memory.creeps[creepName].role

}