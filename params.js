function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

define("ALLOW_CREEP_RENEWING", true);
define("ALLOW_REPAIER_CREEPS", false);

define("CREEP_RENEW_AT", 500); // number of ticket left before renewall
define("CREEP_RENEW_UPTO", 3000);
define("CREEP_TICKS_BETWEEN_REVIEW", 60);
define("CREEP_RENEW_AT_SAME_TIME", 1);


//Loging

const LogLevel = {ALWAYS: -1, NOTHING: 0,INFO: 1, DEBUG: 2, DETAILED: 3};
define("LogLevel", LogLevel);
const Role = {WORKER: 'worker', MINER: 'miner', CARRIER: "carrier"};
define("Role", Role);

define("LOG_ROOM_LEVEL", LogLevel.DETAILED);
define("LOG_SPAWN_LEVEL", LogLevel.NOTHING);
define("LOG_CREEP_LEVEL", LogLevel.NOTHING);

define("LOG_CREEP_NAME", "");


/* Defaults
*/
define("DEFAULT_WALL_HITPOINT", 12000);


// Roles
var roles = [
    {
        roleName: "harvester",
        tickBeforeRenew: define.CREEP_TICKS_BETWEEN_REVIEW,
        renewAt: define.CREEP_RENEW_AT,
        enforeMaxNoOfCreepReviewAtOnce: true,
        overRideReviewAtOnceIfLiveLessThen: 300
    },
    {
        roleName: "upgrader",
        tickBeforeRenew: define.CREEP_TICKS_BETWEEN_REVIEW,
        renewAt: define.CREEP_RENEW_AT,
        enforeMaxNoOfCreepReviewAtOnce: true,
        overRideReviewAtOnceIfLiveLessThen: 300
    },
    {
        roleName: "builder",
        tickBeforeRenew: define.CREEP_TICKS_BETWEEN_REVIEW,
        renewAt: define.CREEP_RENEW_AT,
        enforeMaxNoOfCreepReviewAtOnce: true,
        overRideReviewAtOnceIfLiveLessThen: 300
    },
    {
        roleName: "miner",
        tickBeforeRenew: 1000,
        renewAt: define.CREEP_RENEW_AT,
        enforeMaxNoOfCreepReviewAtOnce: true,
        overRideReviewAtOnceIfLiveLessThen: 300
    },
    {
        roleName: "carrier",
        tickBeforeRenew: define.CREEP_TICKS_BETWEEN_REVIEW,
        renewAt: define.CREEP_RENEW_AT,
        enforeMaxNoOfCreepReviewAtOnce: true,
        overRideReviewAtOnceIfLiveLessThen: 300
    },
    {
        roleName: "LongRangeHarvester",
        tickBeforeRenew: 1000,
        renewAt: 700,
        enforeMaxNoOfCreepReviewAtOnce: false,
        overRideReviewAtOnceIfLiveLessThen: 300
    },
    {
        roleName: "worker",
        tickBeforeRenew: define.CREEP_TICKS_BETWEEN_REVIEW,
        renewAt: define.CREEP_RENEW_AT,
        enforeMaxNoOfCreepReviewAtOnce: true,
        overRideReviewAtOnceIfLiveLessThen: 300
    }
];
define("roles", roles);



const CreepTasks = {
    //
    FIND_SOURCE: "FIND_SOURCE",
    FIND_ENERGY: "FIND_ENERGY",
    DROPOFF_ENERGY: "DROPOFF_ENERGY",

    //Bulding 
    BUILD: "BUILD",
    UPGRADE_CONTROLLER: "UPGRADE_CONTROLLER",

    // Renewing
    RENEWING: "RENEWING",
    RENEWING_MOVING_TO_SPAWN:"RENEWING_MOVING_TO_SPAWN"

};;
define("CreepTasks", CreepTasks);
