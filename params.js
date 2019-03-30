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


/* Defaults
*/
define("DEFAULT_WALL_HITPOINT", 12000);

