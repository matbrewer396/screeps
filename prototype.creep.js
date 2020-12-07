let creepLogic = require('./roles');


/**
 * Summary. Process creep
 */
Creep.prototype.getRoleConfig = function () {
    var myRole = this.memory.role;
    return config.Roles.filter(function (r) { return r.roleName == myRole })[0];
}
/**
 * Summary. Process creep
 */
Creep.prototype.run = function () {
    this.hasBeenHitCal()

    if (this.memory.currentRole == null) {
        this.log("roles is null", LogLevel.DEBUG);
        this.memory.currentRole = this.memory.role
        return;
    }
    this.log("Run(); Role:" + this.getRoleConfig().roleName + "; Task: " + this.memory.task + "; E: " + this.store[RESOURCE_ENERGY] + '/' + this.store.getFreeCapacity(RESOURCE_ENERGY), LogLevel.DEBUG);




    if (this.name == config.LogOverRide.Creep) {
        this.room.visual.circle(this.pos, { fill: 'transparent', radius: 0.45, stroke: config.Creep.Debug.Visual })
    }

    this.checkPos();
    /* Review Creep
    */
    this.log("tickBeforeReview " + this.memory.tickBeforeReview, LogLevel.DEBUG);
    if (this.memory.tickBeforeReview == null) {
        this.log("tickBeforeReview role " + this.getRoleConfig().tickBeforeReview, LogLevel.DEBUG);
        this.memory.tickBeforeReview = this.getRoleConfig().tickBeforeReview;
    } else if (this.memory.tickBeforeReview == 0 || this.memory.renewing) {
        this.log("Eval Renewing", LogLevel.DEBUG);
        if (this.review()) { return };
    } else {
        this.memory.tickBeforeReview -= 1;
    }

    /* Find what to do
    */

    creepLogic[this.memory.role].run(this)

    if (this.name == config.LogOverRide.Creep) {
        if (this.memory.lastDropOffTarget){
            let pos = Game.getObjectById(this.memory.lastDropOffTarget).pos
            if (pos){
                this.room.visual.circle(pos, { fill: 'transparent', radius: 0.45, stroke: "red" })
            }
            pos = Game.getObjectById(this.memory.workerTarget).pos
            if (pos){
                this.room.visual.circle(pos, { fill: 'transparent', radius: 0.45, stroke: "green"})
            }
            
        }
        
    }

    
};


Creep.prototype.hasBeenHitCal = function () {
    if (!this.memory.lastHits) { this.memory.lastHits = this.hits }
    if (!this.memory.isUnderAttack) { this.memory.isUnderAttack = false }
    if (!this.memory.isUnderAttackExpiry) { this.memory.isUnderAttackExpiry = 0 }

    if (this.memory.lastHits !== this.hits) {
        // just started being hit
        this.memory.isUnderAttack = true
        this.memory.isUnderAttackExpiry = config.Creep.isUnderAttack.Expiry;
        
    } else if (this.memory.isUnderAttack) {
        // was under attack
        if (this.memory.isUnderAttackExpiry  <= 0 ) {
            this.memory.isUnderAttack = false
        } else {
            this.memory.isUnderAttackExpiry -= 1
        }
    } 
    return
}
Creep.prototype.isUnderAttack = function () {
    return this.memory.isUnderAttack;
}








//     /**
//      * Summary. Assign creep a new role
//      */
//     Creep.prototype.newRole = function (roleName) {
//         this.memory.role = roleName;
//         this.memory.currentRole = roleName;
//     }

/**
 * Summary. Get cost of creep
 * @return integer 
 */


//     /**
//      * Summary. Havest E
//      * @return void
//      */


//     /**
//     * Summary. Process creep
//     * @return boolean - ture in home room, false moving
//     */
//     Creep.prototype.goHomeRoom = function () {
//         var homeRoom = Game.rooms[Memory.primaryRoom];
//         if (homeRoom == this.room) {
//             return true; // Creep is home
//         } else {
//             var exits = this.room.findExitTo(homeRoom);
//             this.moveTo(this.pos.findClosestByRange(exits));
//             return false;
//         }
//     }


//     /**
//     * Summary. Is in home room
//     * @return boolean - ture in home room, false moving
//     */
//     Creep.prototype.isHome = function () {

//         var homeRoom = Game.rooms[Memory.primaryRoom];
//         if (homeRoom == this.room) {
//             return true; // Creep is home
//         } else {
//             return false;
//         }
//     }

//    /**
//    * Summary. 
//    * @return boolean - ture in home room, false moving
//    */
Creep.prototype.upgradeRoomController = function () {
    if (this.setTask(CreepTasks.UPGRADE_CONTROLLER)) {
        this.memory.workerTarget = this.room.controller.id;
    };
    if (this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
        this.moveTo(this.room.controller, { visualizePathStyle: { stroke: '#ffaa00' } });
    }
}

Creep.prototype.getTask = function () {
    var currentTask = this.memory.task;
    if ((currentTask == CreepTasks.FIND_ENERGY && this.store.getFreeCapacity(RESOURCE_ENERGY) == 0)
        || (currentTask == CreepTasks.HEALING && !this.isInjured())
    ) {
        this.taskCompleted();
        return;
    }
    return currentTask;
}

Creep.prototype.setTask = function (task) {
    if (this.memory.task !== task) {
        this.log("Task changed to " + task + ' from ' + this.memory.task, LogLevel.INFO);
        this.memory.task = task;
        return true;
    } else {
        this.log("Task is " + task, LogLevel.DEBUG);
        return false;
    }

}


Creep.prototype.taskCompleted = function () {
    this.log("Task (" + this.memory.task + ") is completed", LogLevel.INFO);
    var currentTask = this.memory.task;
    this.memory.task = null;
    /* clean temp var
    */
    this.memory.useSource = null;
    this.memory.currentRole = this.memory.role; // Reset to primary role
    return this.review();
}

Creep.prototype.buildIt = function (target) {
    this.log("building " + target + '; Progess: ' + target.progress, LogLevel.INFO);
    var r = this.build(target)
    this.log("build outcome: " + r, LogLevel.DEBUG);
    if (r == ERR_NOT_IN_RANGE) {
        this.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
    }
}


Creep.prototype.isInjured = function () {
    return this.hitsMax > this.hits
}

Creep.prototype.healMe = function () {
    this.setTask(CreepTasks.HEALING);
    let spawn = this.pos.findClosestByRange(FIND_MY_SPAWNS)
    if (!spawn) {
        this.log("No spawn in this room", LogLevel.DEBUG);
        this.moveToRoom(this.memory.myRoom);
        return
    }
    this.log("found spawn", LogLevel.DEBUG);
    this.moveTo(spawn.pos)

    return;
}


/**
 * Find hostile and attack
 */
Creep.prototype.seekAndAttack = function () {
    let closestHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

    // console.log(this.room.find(FIND_HOSTILE_CREEPS).length)
    // console.log(_(Game.creeps).filter(
    //     {
    //         memory: {
    //             role: Role.GUARDIAN
    //             , guardRoom: this.room.name
    //         }

    //     }).value().length)
    let noOfHost = this.room.find(FIND_HOSTILE_CREEPS).length;
    let noOfGuard = _(Game.creeps).filter(
        {
            memory: {
                role: Role.GUARDIAN
                , guardRoom: this.room.name
            }

        }).value().length

    if (noOfHost>= noOfGuard 
            && noOfHost > 0 
            && Military.rapidResponseRequest(this.room.name)
        ) {
            this.log("Reinforcement request, room: " + this.room.name
            + "; Hostiles: " + noOfHost
            + "; Guard: " + noOfGuard
            , LogLevel.ALWAYS);

    };
    
    if (closestHostile) {
        this.log("Hostile- " + closestHostile + "; Room: " + this.room.name, LogLevel.ALWAYS)
        this.setTask(CreepTasks.ATTACKING)
        if (this.pos.getRangeTo(closestHostile.pos) <= 1) {
            this.rangedAttack(closestHostile);
            this.attack(closestHostile);
        } if (this.pos.getRangeTo(closestHostile.pos) <= 3) {
            this.rangedAttack(closestHostile);
            // if target only has melee move away
        } else {
            this.moveTo(closestHostile.pos, { visualizePathStyle: { stroke: '#ffffff' } })
        }
        this.memory.lastHostileSeen = Game.time;
        return true;
    }
    return false

}

Creep.prototype.hasWorkingPart = function (part) {
    this.body.filter(function (b) {
        if (b.hits == 0 ) { return false }
        if (b.type == part ) {return true }
        return false
    })
}
Creep.prototype.canWork = function () {
    return this.hasWorkingPart(WORK)
}

Creep.prototype.canMove = function () {
    return this.hasWorkingPart(MOVE)
}

Creep.prototype.canAttack = function () {
    if (this.hasWorkingPart(ATTACK)) {return true}
    if (this.hasWorkingPart(RANGED_ATTACK)) {return true}
    return false
}
Creep.prototype.canHeal = function () {
    return this.hasWorkingPart(HEAL)
}

Creep.prototype.canClaim = function () {
    return this.hasWorkingPart(CLAIM)
}
