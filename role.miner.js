
var myConfig = config.Roles.filter(function (r) { return r.roleName == Role.MINER })[0]
var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        creep.memory.task = "Miner";
        if (creep.memory.minerSource == null || creep.memory.minerContrainer == null) {
            creep.memory.task = CreepTasks.FIND_SOURCE;
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

            if (myContainer == undefined) {
                creep.log("conatiner doesnt exists", LogLevel.INFO);
                creep.memory.minerContrainer = null;
            }

            if(creep.pos.getRangeTo(myContainer ) == 0) {
                creep.log("harvesting", LogLevel.DEBUG);
                let r = creep.harvest(creep.pos.findClosestByPath(FIND_SOURCES))
                if (r == ERR_NOT_ENOUGH_RESOURCES && creep.ticksToLive < 1400){
                    creep.review(true)
                }
                creep.log("harvesting outcome: " + r, LogLevel.DEBUG);
            } else {
                creep.log("moving", LogLevel.DEBUG);
                creep.log(creep.name + 'move ' + creep.moveTo(Game.getObjectById(creep.memory.minerContrainer)), LogLevel.DEBUG);
            }
           
        }
        
    },
    spawnData: function(room) {
        let name = getNewCreepName("MINER");
        let body = [];
        let memory = {
            role: Role.MINER,
            myRoom: room.name
        };
        let energyAvailable = room.energyAvailable - 50;
        body.push(MOVE)
        if (myConfig.maxbodyCost -50 <= energyAvailable) {
            energyAvailable = myConfig.maxbodyCost -50
        }
        
        body = fnBuildBody(body, [WORK],energyAvailable);
        room.log("Spwaming new workder - " + name + ' body: ' + body.toString(),LogLevel.DEBUG);
        return {name, body, memory};
    
    }, noRequiredCreep: function(room) {
        return room.findSources().length
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