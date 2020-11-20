var params = require('params');
const LogLevel = params.LogLevel;
const Role = params.Role;
module.exports = function () {
    Room.prototype.creeps;
    Room.prototype.sources;
    Room.prototype.noOfSources;
    Room.prototype.noOfCreeps;
    Room.prototype.noOfCarrier;
    

    Room.prototype.isPrimaryRoom = function () {
        var primaryRoom;
        if (this.name == Memory.primaryRoom) {
            return (true);
        } else {
            return (false);
        }
    }

    Room.prototype.log = function (msg, LogLevel) {
        if (params.LOG_ROOM_LEVEL >= LogLevel) {
            console.log("Room:" + this.name + "; Msg: " + msg);
        }
    }

   
    /**
     * find a space that can be build on 
     * @param {} x  location to look at
     * @param {*} y location to look at
     * @param {*} range 
     * @param {*} room target room
     */
    function findFreePos(x,y,range, room) {
        var possibleSite
        for (i = -1; i < 2; i++) {
            for (j = -1; j < 2; j++) {
                var cX = x+i;
                var cY = y+j;
                possibleSite = room.getPositionAt(cX,cY);
                room.log(cX +' - ' + cY + ' ' + possibleSite.look()[0].terrain, LogLevel.DETAILED)
                // find site without walls
                if (possibleSite.look()[0].terrain == "plain"){
                    return (possibleSite);
                }
            }
        }
        return null;
    }

     /* Build a container for upgraded
     */
     function buildControllerContainer(room) {
        room.log('Build Controller Container ' + room.controller, LogLevel.INFO);
        var x = room.controller.pos.x;
        var y = room.controller.pos.y;

        var i;
        var j;
        var containerSite = findFreePos(room.controller.pos.x,room.controller.pos.y,1,room);
        
        if (containerSite !== undefined) {
            room.log('Build Controller Container ' + containerSite, LogLevel.INFO);
            room.memory.controllerContainer = containerSite.createConstructionSite(STRUCTURE_CONTAINER);
            room.log('Container id ' + room.memory.controllerContainer, LogLevel.INFO);
         } else {
            room.log('Cant find site', LogLevel.ALWAYS);
        }
    }
    /**
     * find sources and build where missing container
     * @param {*} room Target room
     */
    function buildSourceContainer(room) {
        var sources = room.find(FIND_SOURCES);
        for(var i in sources){
            var source = sources[i];
            room.log('Checking source has container: ' + source, LogLevel.INFO);
            
            var container = findContainerRightNextTo(sources[i].pos);

            if (container !== undefined) {
                room.log('Found container: ' + container, LogLevel.INFO);
                return;
            };
            var buildsite = findFreePos(source.pos.x,source.pos.y,1,room);
            room.log('Found site ' + buildsite, LogLevel.INFO);
            buildsite.createConstructionSite(STRUCTURE_CONTAINER);
        }
    }


   

    Room.prototype.startUp = function () {
        this.log('startUp() is now processing. isPrimaryRoom: ' + this.isPrimaryRoom(), LogLevel.INFO);
        
        // Setup memory objects
        if (this.memory.roomInit == null) {
            this.newRoow();
        }
        var spawn = this.find(FIND_MY_SPAWNS)[0];
        //this.memory.MinWallHitPoint = params.DEFAULT_WALL_HITPOINT;
        /* Stats
        */
        buildStats(this);
        

        /* Exit if not primary
        */
        if (this.isPrimaryRoom() == false) { return };

        buildSourceContainer(this);
            
        buildPath(this.find(FIND_MY_SPAWNS)[0].pos, this.controllerContainer().pos, this);

        //buildContainter(this);
        /* Room Settings
        */
        //
        var noOfUpgraderRequired = 0
        if (this.energyCapacityAvailable > 450 && !this.memory.controllerContainer) {
            buildControllerContainer(this);
            this.controllerContainer();
            noOfUpgraderRequired = 1; 
        } else if (this.controllerContainer() !== null) {
            noOfUpgraderRequired = 1; 
        }
        


    //     if (noOfMiners >= 1 && this.memory.ALLOW_HAVESTER == true) {
    //         this.memory.ALLOW_HAVESTER = false;
    //     }
    //     if (noOfHarvesters > 0 && this.memory.ALLOW_HAVESTER == false) {
    //         var harvesters = this.creeps = this.find(FIND_MY_CREEPS, {filter: (c) => {
    //             return c.memory.role == 'harvester';
    //         }})

    //         for (var h in harvesters){
    //             harvesters[h].newRole("builder");
    //         }
    //     }

        /* spamn creeps
        */

       if (noOfWorkers == 0 && this.energyAvailable >= 300) {
            MSBSpawnCreep('WORKER',noOfWorkers, this.memory.NumberOf_Min_WORKER, 'worker', spawn, undefined);
        }

        if (noOfMiners == 0 && this.energyAvailable >= 300) {
            MSBSpawnCreep('MINER',noOfMiners, this.memory.NumberOf_Target_MINER, 'miner', spawn, undefined, this);
        }

        
        //this.memory.NumberOf_Target_CARRIER
       if (this.energyAvailable  == this.energyCapacityAvailable) {
            MSBSpawnCreep('WORKER',noOfWorkers, 4, 'worker', spawn, undefined)
            MSBSpawnCreep('MINER',noOfMiners, this.memory.NumberOf_Target_MINER, 'miner', spawn, undefined, this)
            MSBSpawnCreep('CARRIER',this.noOfCarrier, 1, 'carrier', spawn, undefined)
            MSBSpawnCreep('UPGRADER',noOfUpgrader, noOfUpgraderRequired, 'upgrader', spawn, undefined, this)
            // MSBSpawnCreep('WORKER',noOfWorkers, this.memory.NumberOf_Target_WORKER, 'harvester', spawn, undefined)
        }

        
    };

    //var noOfHarvesters  
    var noOfMiners      
    //var noOfBuilder     
    var noOfCreepsRenewing
    //var noOfCreepsRenewing
    var noOfWorkers
    var noOfUpgrader

    function buildStats(r) {
        r.creeps = r.find(FIND_MY_CREEPS);

        noOfWorkers = _.sum(r.creeps, (c) => c.memory.role == 'worker');
        //noOfHarvesters  = _.sum(r.creeps, (c) => c.memory.role == 'harvester');
        noOfMiners      = _.sum(r.creeps, (c) => c.memory.role == 'miner');
        noOfUpgrader      = _.sum(r.creeps, (c) => c.memory.role == 'upgrader');
        //noOfBuilder     = _.sum(r.creeps, (c) => c.memory.role == 'builder');
        r.noOfCarrier     = _.sum(r.creeps, (c) => c.memory.role == 'carrier');
        r.noOfCreeps = r.creeps.length;
        noOfCreepsRenewing = _.sum(r.creeps, (c) => c.memory.renewing == true)
        r.sources = r.find(FIND_SOURCES);
        r.noOfSources = _.sum(r.sources);

        r.log('EnergyAvailable: ' + r.energyAvailable + ' of ' + r.energyCapacityAvailable,LogLevel.INFO );
        r.log('Creeps: ' + r.noOfCreeps + ', worker: ' + noOfWorkers + ', Miners: ' + noOfMiners + ', Carrier ' + r.noOfCarrier + ', Renewing ' + noOfCreepsRenewing, LogLevel.INFO);
    };

    function MSBSpawnCreep(creepNamePrefix, currentNoOf, noOfCreepRequired, roleName, spawn, body, r) {
        if ( currentNoOf < noOfCreepRequired) {
            
            if (creepNamePrefix == 'WORKER') {
                var r = spawn.createCreepWorker(creepNamePrefix,roleName);
            } else if (creepNamePrefix == 'MINER') {
                var r = spawn.createCreepMiner(creepNamePrefix, roleName);
            } else if (creepNamePrefix == 'UPGRADER') {
                var r = spawn.createCreepUpgrader(roleName);
            }else if (creepNamePrefix == 'CARRIER') {
                var r = spawn.createCarrier(creepNamePrefix, roleName);
            } else if (body !== null) {
                console.log(creepNamePrefix)
                console.log(body)
                var name = spawn.getNameName(creepNamePrefix);
                console.log("Spwaming new creep - " + name)
                console.log(spawn.spawnCreep(body, name, { memory: { role: roleName } }));
            }
        }
    };



    function findContainerRightNextTo(pos) {
        var container = pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER );
            }
        });
        
        if (pos.getRangeTo(container) > 1){
            container = null;
        } else {
            return(container);
        }

        container = pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER );
            }
        });

        if (pos.getRangeTo(container) > 1){
            container = null;
        }
        return(container);
    }

    /* Return the container next to controller
    */
    Room.prototype.controllerContainer = function () {
        var container = Game.getObjectById(this.memory.controllerContainer);
        
        if (container !== null){
            this.log("By memory" + container, LogLevel.DETAILED);
            return container;
        }
        
        container = findContainerRightNextTo(this.controller.pos)
        this.log("By findContainerRightNextTo" + container, LogLevel.DEBUG);
        if (!container) {
            return null;
        } else {
            this.log("site: " + container, LogLevel.DEBUG);
            this.memory.controllerContainer = container.id;
            return container;
        }
    }
    Room.prototype.newRoow = function () {
        this.log("new room - set memory defaults", LogLevel.ALWAYS);
        this.memory.roomInit = true;
        this.memory.ALLOW_HAVESTER = true;

        this.memory.NumberOf_Target_CARRIER = 0;
        this.memory.NumberOf_Target_MINER = 2;
        this.memory.NumberOf_Target_WORKER = 10;
        this.memory.NumberOf_Min_WORKER = 2;
        this.memory.MinWallHitPoint = params.DEFAULT_WALL_HITPOINT;
    };
  
    Room.prototype.getEnergyDropTarget = function (pos) {
        var target;
        if (pos == null) {
            var targets = this.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER ||
                            (structure.structureType == STRUCTURE_CONTAINER && structure.id == this.controllerContainer().id)
                            ) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });

            if (targets.length > 0) {
                target = targets[0];
            }  
        } else {
            target = pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN ) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 1)
                            || (structure.structureType == STRUCTURE_CONTAINER 
                                && structure.id == this.controllerContainer().id
                                 && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 400 )
                            ||( structure.structureType == STRUCTURE_TOWER  && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 200 ) ;
                }
            });
        }

        return target;
    }

    //_.sum(Game.creeps, (c) => c.memory.role == 'harvester');

    /* Clear down any var used
    */
    Room.prototype.cleanUp =function () {
        this.creeps = undefined;
    };


    function buildPath(posA, posB, room) {
        var path = posA.findPathTo(posB);
        for (var i = 0; i < path.length; i++) 
        {
            room.log("Path: " + path[i].x + ' - ' + path[i].y, LogLevel.DETAILED)
          
           // room.log(path[i].x +' - ' + path[i].y + ' ' + path[i].look()[0].terrain, LogLevel.DETAILED)
            // find site without walls
            // if (possibleSite.look()[0].terrain == "plain"){
            //     return (possibleSite);
            // }

            room.createConstructionSite(path[i].x,path[i].y, STRUCTURE_ROAD);
        }
    }
}