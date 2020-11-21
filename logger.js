Room.prototype.log = function (msg, LogLevel) {
    logger(msg,LogLevel,"Room",this);
}
Creep.prototype.log = function (msg, LogLevel) {
    logger(msg,LogLevel,"Creep",this);
}

StructureSpawn.prototype.log = function (msg, LogLevel) {
    logger(msg,LogLevel,"StructureSpawn",this);
}


function logger(msg, LogLevel, ObjectType, Object){
    if (LogLevel == undefined) {
        console.log("LogLevel, undefined. " + msg)
    }

    if (config.LogLevel[ObjectType] >= LogLevel || config.LogOverRide[ObjectType] == Object.name ) {
        console.log(ObjectType + ": " + Object.name + '; ' + msg);
    }
}
