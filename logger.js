Room.prototype.log = function (msg, LogLevel) {
    logger(msg,LogLevel,"Room",this);
}
Creep.prototype.log = function (msg, LogLevel) {
    logger(msg,LogLevel,"Creep",this);
}

StructureSpawn.prototype.log = function (msg, LogLevel) {
    logger(msg,LogLevel,"StructureSpawn",this);
}




global.logger = function logger(msg, LogLevel, ObjectType, Object){
    let name;
    if (LogLevel == undefined) {
        console.log("LogLevel, undefined. " + msg)
    }

    if (Object) {
        name = Object.name
    }

    if (config.LogLevel[ObjectType] >= LogLevel || config.LogOverRide[ObjectType] == name ) {
        console.log(ObjectType + ": " + name + '; ' + msg);
    }
}
