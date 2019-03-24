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


    Creep.prototype.collectEnergy = function () {
        var dropped = this.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
            filter: (d) => {return (d.resourceType == RESOURCE_ENERGY && d.amount > 50)}
        });

        if (dropped !== null) {
            if(this.pickup(dropped) == ERR_NOT_IN_RANGE) {
                this.moveTo(dropped);
            }
            return;
        }

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
        }
    }

    Creep.prototype.newRole = function (roleName) {
        this.memory.role = roleName;
        this.memory.currentRole = roleName;
    }


}