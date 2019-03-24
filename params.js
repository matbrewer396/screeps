function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

define("ALLOW_CREEP_RENEWING", true);
define("CREEP_RENEW_AT", 500); // number of ticket left before renewall
define("CREEP_RENEW_UPTO", 3000);


/* Defaults
*/
define("DEFAULT_WALL_HITPOINT", 10000);

