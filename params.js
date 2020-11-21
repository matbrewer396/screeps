function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}



/* Defaults
*/
define("DEFAULT_WALL_HITPOINT", 12000);





const CreepTasks = {
    //
    FIND_SOURCE: "FIND_SOURCE",
    FIND_ENERGY: "FIND_ENERGY",
    DROPOFF_ENERGY: "DROPOFF_ENERGY",

    //Worker Job 
    BUILD: "BUILD",
    UPGRADE_CONTROLLER: "UPGRADE_CONTROLLER",
    REPAIRER: "REPAIRER",

    // Renewing
    RENEWING: "RENEWING",
    RENEWING_MOVING_TO_SPAWN:"RENEWING_MOVING_TO_SPAWN"

};;
define("CreepTasks", CreepTasks);
