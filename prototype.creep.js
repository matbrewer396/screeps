var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleBuilder = require('role.builder');
var roleMiner = require('role.miner');
var roleCarrier = require('role.carrier');
var roleLongRangeHarvester = require('role.longRangeHarvester');

var params = require('params');

module.exports = function () {
    /**
     * Summary. Process creep
     */
    Creep.prototype.run = function () {
        this.memory.task = "...";

        if (this.memory.currentRole == null){
            console.log("roles is null")
            this.memory.currentRole = this.memory.role
        }

        /* Review Creep
        */
        //console.log("mem " + this.memory.tickBeforeRenew);
        if (this.memory.tickBeforeRenew == null) {
            this.memory.tickBeforeRenew = params.CREEP_TICKS_BETWEEN_REVIEW;
        } else if (this.memory.tickBeforeRenew == 0) {
            /* Is old Model?
            */
            bodyCode = this.getBodyCost();
            var maxBodySize = Game.rooms[Memory.primaryRoom].energyCapacityAvailable

            if (this.memory.role == 'miner') {
                maxBodySize = 1050 // 10 * 100  (10 WORK, Cost 100) + 50 (MOVE, Cost 50) 
            }


            if (this.getBodyCost() < maxBodySize - 150) { // 150 allow for rounding
                // Disable to allow new model to be created
                this.memory.AllowRenewing = false;
            } else {
                this.memory.AllowRenewing = true;
            }

            /* Deal with renewing
            */
            if (params.ALLOW_CREEP_RENEWING
                && this.room.noOfCreeps > 1
                && this.memory.AllowRenewing != false
                && ((this.ticksToLive < params.CREEP_RENEW_AT)
                    || (this.memory.renewing && this.ticksToLive < params.CREEP_RENEW_UPTO)
                    ) ) {

                /* Max number of creeps allowed to renew
                */
                if (this.memory.renewing == false && _.sum(this.room.creeps, (c) => c.memory.renewing == true) >= (params.CREEP_RENEW_AT_SAME_TIME - 1)) {

                }
                console.log("Renewing - " + this.name)
                this.memory.task = "Renewing";
                this.memory.renewing = true;
                var spawn = this.room.find(FIND_MY_SPAWNS)[0];
                var r = spawn.renewCreep(this);
                console.log("Renewing - " + this.name + ' - ' + r)
                if (r == ERR_NOT_IN_RANGE) {
                    this.memory.task = "Renewing - Move to Spawn";
                    this.moveTo(spawn);
                } else if (r == ERR_FULL) {
                    this.memory.renewing = false;
                }
                return;
            } else if (this.memory.recycle) {
                /* Handles recycling
                */
                var spawn = this.room.find(FIND_MY_SPAWNS)[0];
                var r = spawn.recycleCreep(this);
                console.log("Recycling - " + this.name + ' - ' + r)
                if (r == ERR_NOT_IN_RANGE) {
                    this.memory.task = "Recycling - Move to Spawn";
                    this.moveTo(spawn);
                }
                return
            } else {
                this.memory.renewing = false
                this.memory.tickBeforeRenew = params.CREEP_TICKS_BETWEEN_REVIEW;
            }
        } else {
            this.memory.tickBeforeRenew -= 1;
        }
       
        
        /* execute roles
        */ 
        if(this.memory.currentRole == 'harvester') {
            roleHarvester.run(this);
        }
        if(this.memory.currentRole == 'upgrader') {
            roleUpgrader.run(this);
        }
        if(this.memory.currentRole == 'builder' ) {
            roleBuilder.run(this);
        }
        if (this.memory.role == 'miner') {
            roleMiner.run(this);
        }
        if (this.memory.role == 'carrier') {
            roleCarrier.run(this);
        }
        if (this.memory.role == 'LongRangeHarvester') {
            roleLongRangeHarvester.run(this);
        }

        
            
    };


    Creep.prototype.collectEnergy = function (havevestIsNone) {

        // Already on route 
        if (this.memory.useSource != null) {
            this.harvestSource();
            return;
        }

        /* Look for dropped items
        */
        var dropped = this.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
            filter: (d) => {return (d.resourceType == RESOURCE_ENERGY && d.amount > 50)}
        });

        if (dropped !== null) {
            if(this.pickup(dropped) == ERR_NOT_IN_RANGE) {
                this.moveTo(dropped);
            }
            return;
        }

        /* head to container
        */

        var container = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > this.carryCapacity);
            }
        });

        if (container == null) {
            container = this.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0);
                }
            });
        };

        if (container !== null) {
            if ( this.withdraw(container, RESOURCE_ENERGY) != OK) {
                this.moveTo(container);
            }
            return;
        } else if (havevestIsNone == true) {
            /* eught should happen 
            */
            this.harvestSource();
        }

    }


    /**
     * Summary. Assign creep a new role
     */
    Creep.prototype.newRole = function (roleName) {
        this.memory.role = roleName;
        this.memory.currentRole = roleName;
    }

    /**
     * Summary. Get cost of creep
     * @return integer 
     */
    Creep.prototype.getBodyCost = function () {
        var BODYPART_COST = { "move": 50, "work": 100, "attack": 80, "carry": 50, "heal": 250, "ranged_attack": 150, "tough": 10, "claim": 600 };
        var cost = 0;
        for (var part in this.body) {
            cost += BODYPART_COST[this.body[part].type];
        }

        return cost;
    }

    /**
     * Summary. Havest E
     * @return void
     */
    Creep.prototype.harvestSource = function (source) {
        if (this.memory.forceSource != null) {
            var sources = this.room.find(FIND_SOURCES);
            source = sources[creep.memory.forceSource];
        } else if (this.memory.useSource != null) {
            source = Game.getObjectById(this.memory.useSource)
            this.memory.task = "harvesting from " + source.id;
        } else {
            var sources = this.room.find(FIND_SOURCES);
            source = sources[_.random(0, sources.length-1)]
            this.memory.useSource = source.id;
            this.memory.task = "harvesting from new source" + source.id;
        }
        

        if (this.harvest(source) == ERR_NOT_IN_RANGE) {
            this.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
        }

    }

    /**
     * Summary. dropOffEnergy at room target
     * @return boolean 
     */
    Creep.prototype.dropOffEnergy = function (controller) {
        var target = this.room.getEnergyDropTarget(controller, this.pos);

        if (target == null) {
            return false;
        }

        this.memory.task = "Dropping off at " + target.id;
        var r = this.transfer(target, RESOURCE_ENERGY)
        
        if (r == ERR_NOT_IN_RANGE) {
            this.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
        } 
        return true;
    }


    /**
    * Summary. Process creep
    * @return boolean - ture in home room, false moving
    */
    Creep.prototype.goHomeRoom = function () {
        var homeRoom = Game.rooms[Memory.primaryRoom];
        if (homeRoom == this.room) {
            return true; // Creep is home
        } else {
            var exits = this.room.findExitTo(homeRoom);
            this.moveTo(this.pos.findClosestByRange(exits));
            return false;
        }
    }


    /**
    * Summary. Is in home room
    * @return boolean - ture in home room, false moving
    */
    Creep.prototype.isHome = function () {
        
        var homeRoom = Game.rooms[Memory.primaryRoom];
        if (homeRoom == this.room) {
            return true; // Creep is home
        } else {
            return false;
        }
    }

   /**
   * Summary. 
   * @return boolean - ture in home room, false moving
   */
    Creep.prototype.upgradeRoomController = function () {
        if (this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
            this.moveTo(this.room.controller, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
    }


    

}