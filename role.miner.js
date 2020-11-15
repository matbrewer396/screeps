var params = require('params');
const LogLevel = params.LogLevel;
const Tasks = params.CreepTasks;
var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        creep.memory.task = "Miner";
        if (creep.memory.minerSource == null || creep.memory.minerContrainer == null) {
            creep.memory.task = Tasks.FIND_SOURCE;
            /* find container for source
            */
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER);
                }
            });
            creep.log("Needs a source", LogLevel.DEBUG);
            tryAssignContainers(creep,containers);
            if (!tryAssignContainers(creep,containers)) {
                creep.log("No source container found", LogLevel.DEBUG)
                var sties = creep.room.find(FIND_CONSTRUCTION_SITES, {
                    filter: (structure) => { 
                        return (structure.structureType == STRUCTURE_CONTAINER ) }
                });
                creep.log("Building Site found" + sties, LogLevel.DEBUG)
                // //var existing = _.sum(Game.creeps, (c) => c.memory.minerContrainer == contrainers[contrainer].id);
                tryAssignContainers(creep,sties);
            }

                
        } else {
            creep.log("mining", LogLevel.DEBUG);
            creep.memory.task = "mineing existing source";
            myContainer = Game.getObjectById(creep.memory.minerContrainer);

            if(creep.pos.getRangeTo(myContainer ) == 0) {
                creep.log("harvesting", LogLevel.DEBUG);
                creep.harvest(creep.pos.findClosestByPath(FIND_SOURCES))
            } else {
                creep.log("moving", LogLevel.DEBUG);
                console.log(creep.name + 'move ' + creep.moveTo(Game.getObjectById(creep.memory.minerContrainer)));
            }
            
            // if (myContainer.progress < 100){
            //     creep.buildIt(myContainer);
            // } else {
            //     if(creep.pos.getRangeTo(myContainer ) == 0) {
            //         creep.log("harvesting", LogLevel.DEBUG);
            //         creep.harvest(creep.pos.findClosestByPath(FIND_SOURCES))
            //     } else {
            //         creep.log("moving", LogLevel.DEBUG);
            //         console.log(creep.name + 'move ' + creep.moveTo(Game.getObjectById(creep.memory.minerContrainer)));
            //     }
            // }
        }
        
    }
};

function tryAssignContainers(creep, containers){
    for(var container in containers) {
        if (tryAssignContainer(creep,containers[container]))
        {
            return (true);
        }
    }
    return (false);
}


function tryAssignContainer(creep, container) {
    creep.log("tryAssignContainer " + container.id, LogLevel.DEBUG);
    // Check for a source next to it
    var source = container.pos.findClosestByPath(FIND_SOURCES);
    //ensure no one else has it
    var existing = _.sum(Game.creeps, (c) => c.memory.minerContrainer == container.id);
    //creep.log(container.id + '; existing: ' + existing + '; range to source: ' + container.pos.getRangeTo(source),LogLevel.DETAILED);
    if (existing == 0 && container.pos.getRangeTo(source) == 1) {
        creep.log("Assigning " + container.id, LogLevel.INFO)
        creep.memory.minerSource = source.id;
        creep.memory.minerContrainer = container.id;
        
        return(true);
    } else {
        creep.log("Failed " + container.id, LogLevel.DEBUG)
        return(false);
    }
}

module.exports = roleMiner;