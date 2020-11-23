Room.prototype.creepsInRole = function (role) {
    return _.sum(this.findMyCreeps(), (c) => c.memory.role == role)
}

Room.prototype.findMyCreeps = function (role) {
    return this.find(FIND_MY_CREEPS)
}