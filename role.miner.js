

var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        creep.memory.task = "Miner";
        if (creep.memory.minerSource == null || creep.memory.minerContrainer == null) {
            creep.memory.task = "Find new source";
            var contrainers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER);
                }
            });
            console.log(creep.name + " - Needs a source")

            for(var contrainer in contrainers) {
                console.log(creep.name + " - trying " + contrainers[contrainer].id )
                creep.memory.task = "found contrainers";
                var source = contrainers[contrainer].pos.findClosestByPath(FIND_SOURCES);

                var existing = _.sum(Game.creeps, (c) => c.memory.minerContrainer == contrainers[contrainer].id);
                if (existing == 0 && contrainers[contrainer].pos.getRangeTo(source) == 1) {
                    console.log(creep.name + " - Assigining " + contrainers[contrainer].id )
                    creep.memory.minerSource = source.id;
                    creep.memory.minerContrainer = contrainers[contrainer].id;
                    
                    break;
                } else {
                    console.log(creep.name + " - " + contrainers[contrainer].id + 'no good - range to source: ' +  contrainers[contrainer].pos.getRangeTo(source))
                }
            }

                
        } else {
            creep.memory.task = "mineing existing source";
            if(creep.pos.getRangeTo(Game.getObjectById(creep.memory.minerContrainer) ) == 0) {
                creep.harvest(creep.pos.findClosestByPath(FIND_SOURCES))
            } else {
                console.log(creep.name + 'move ' + creep.moveTo(Game.getObjectById(creep.memory.minerContrainer)));
            }
        }
        
        
        
    }
};

module.exports = roleMiner;