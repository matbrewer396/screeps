var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleBuilder = require('role.builder');
var roleMiner = require('role.miner');
var roleCarrier = require('role.carrier');

var params = require('params');

module.exports = function () {

    Creep.prototype.run = function () {
        this.memory.task = "...";
        if (this.memory.currentRole == null){
            console.log("roles is null")
            this.memory.currentRole = this.memory.role
        }
        
        
        /* Deal with renewing
        */ 
        if ( params.ALLOW_CREEP_RENEWING
            && this.room.noOfCreeps > 1
            && ( (this.ticksToLive<params.CREEP_RENEW_AT && _.sum(this.room.creeps, (c) => c.memory.renewing == true) == 0) 
                || ( this.memory.renewing && this.ticksToLive < params.CREEP_RENEW_UPTO  ) 
               ) 
             
            ) 
        {
            console.log("Renewing - " + this.name)
            this.memory.task = "Renewing";
            this.memory.renewing = true;
            var spawn = this.room.find(FIND_MY_SPAWNS)[0];
            var r = spawn.renewCreep(this);
            console.log("Renewing - " + this.name+ ' - ' + r)
            if(r == ERR_NOT_IN_RANGE)
            {
                this.memory.task = "Renewing - Move to Spawn";
                this.moveTo(spawn);
            } else if (r == ERR_FULL) {
                this.memory.renewing = false;
            }

        } else if ( this.memory.recycle ) {
            /* Handles recycling
            */
            var spawn = this.room.find(FIND_MY_SPAWNS)[0];
            var r = spawn.recycleCreep(this);
            console.log("Recycling - " + this.name + ' - ' + r)
            if (r == ERR_NOT_IN_RANGE) {
                this.memory.task = "Recycling - Move to Spawn";
                this.moveTo(spawn);
            }

        } else {
            this.memory.renewing = false
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
            if(this.memory.currentRole == 'miner' ) {
                roleMiner.run(this);
            }
            if(this.memory.currentRole == 'carrier' ) {
                roleCarrier.run(this);
            }

            


            
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
            console.log(source.id)
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
    Creep.prototype.dropOffEnergy = function () {
        var target = this.room.getEnergyDropTarget();

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


    

}