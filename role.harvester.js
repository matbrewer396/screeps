/**
 * Harvest resources in near by rooms
 */
var myConfig = config.Roles.filter(function (r) { return r.roleName == Role.HARVESTER })[0]
var roleHarvester = {
    run: function(creep) {

        // if (creep.room.isUnderAttack() && creep.pos.roomName !== creep.memory.myRoom) {
        //     creep.log("HOSTILE - returning home", LogLevel.ALWAYS)
        //     creep.taskCompleted();
        //     creep.moveTo(target);
        // }

        /** do maths */
        if (creep.memory.ticksToSource == undefined && creep.memory.myRoom == creep.room.name){
            let target = creep.memory.remoteSource;
            let targetPos = new RoomPosition(target.x, target.y, target.roomName);
            creep.memory.ticksToSource = creep.room.getRangeBetweenPos(creep.room.findMainSpawns().pos, targetPos)
        }

        
        // if (creep.store[RESOURCE_ENERGY] == 0 
        //     && creep.ticksToLive < 1400
        //     && creep.review()) {
            /** renew creep */    
        if (creep.store[RESOURCE_ENERGY] == 0 || (creep.getTask() == CreepTasks.HARVESTING) ) {
            if(creep.store.getFreeCapacity([RESOURCE_ENERGY]) == 0) {
                creep.log("Im Full", LogLevel.DEBUG)
                creep.taskCompleted();
                creep.memory.workerTarget = null;
            } else {
                /** Pre-harvest check */
                if (creep.getTask() !== CreepTasks.HARVESTING) {
                    if (creep.ticksToLive < (creep.memory.ticksToSource * 4.5)) {
                        creep.log("Pre harvest failed - Need to review", LogLevel.ALWAYS)
                        creep.review(true);
                        return;
                    }
                };

                /** Move and harvest */
                creep.setTask(CreepTasks.HARVESTING);
                creep.pickupDropped(myConfig.pickUpDroppedInRange);
                
                let target = creep.memory.remoteSource;
                let targetPos = new RoomPosition(target.x, target.y, target.roomName);
                if (creep.pos.getRangeTo(targetPos) < myConfig.harvestSourceWithInRange){
                    creep.log("Source is close", LogLevel.DEBUG)
                    let source = creep.pos.findClosestByRange(FIND_SOURCES, { filter: (s) => s.energy > 0 });
                    creep.log("Source found" + source, LogLevel.DEBUG)
                    if(source && creep.pos.inRangeTo(source.pos,myConfig.harvestSourceWithInRange+5)) {
                        creep.log("Source in range: " + source, LogLevel.DEBUG)
                        let r = creep.harvest(source)
                        creep.log("harvest outcome: " + r, LogLevel.DEBUG);
                        if (r == ERR_NOT_IN_RANGE) {
                            creep.moveTo(source);
                        }
                    } else {
                        if (source) {
                            creep.log("no source in range, closet: " + creep.pos.getRangeTo(source.pos), LogLevel.DEBUG)
                        } else {
                            creep.log("no source in range" , LogLevel.DEBUG)
                        }
                        
                        /**
                         * source out of range and current source is empty
                         */
                        if (creep.store.getFreeCapacity([RESOURCE_ENERGY]) < myConfig.noSourcesReturnHomeLessThenFree) {
                            creep.taskCompleted();
                        }
                        
                    }
                   
                } else {
                    creep.log("Moving to target", LogLevel.DEBUG)
                    creep.moveTo(targetPos)
                }
                return;
            }
        } else {
            
            /** Drop off  */
            let target; 
            // if (Game.rooms[creep.memory.myRoom].storage.store[RESOURCE_ENERGY] > myConfig.upgradeIfStorageOver){
                target = Game.rooms[creep.memory.myRoom].storage;
                if (!target) {
                    target = Game.rooms[creep.memory.myRoom].findMainSpawns();
                }

                if (creep.pos.roomName !== creep.memory.myRoom){
                    creep.moveTo(target);
                } else {

                    if (!creep.room.storage || creep.room.storage.store[RESOURCE_ENERGY] < 950000) {
                        creep.room.addRoadToPlan(creep.pos)
                        creep.dropOffEnergy();
                    } else {
                        creep.upgradeRoomController();
                    }
                    
                }
            // } else {
            //     target = Game.rooms[creep.memory.myRoom].controller;
            //     if (creep.pos.roomName !== creep.memory.myRoom || creep.pos.getRangeTo(target) > 5){
            //         creep.moveTo(target);
            //     } else {
            //         creep.upgradeRoomController();
            //     }
            // }
            
            
        }
    
      
        
        
    },
    spawnData: function(room, opt) {
        let name = getNewCreepName("HARVESTER");
        let body = [];
        let memory = {
            role: Role.HARVESTER,
            myRoom: room.name,
            remoteSource: opt.Memory.remoteSource
        };
        let energyAvailable = room.energyAvailable
        let i = 1
        if (energyAvailable >= 800){
            i = 3
        } else if (energyAvailable >= 600) {
            i = 2
        }

        /** Add work pat */
        while (i > 0) {
            body.push(WORK)
            energyAvailable -= CreepBody.filter(function (r) { return r.Part ==WORK})[0].Cost;
            i -= 1;
        }
        
        body = fnBuildBody(body, [CARRY,MOVE],energyAvailable);
        room.log("Spwaming new workder - " + name + ' body: ' + body.toString(),LogLevel.DEBUG);
        return {name, body, memory};
    
    }, noRequiredCreep: function(room) {
        return 0
    }
}



module.exports = roleHarvester;