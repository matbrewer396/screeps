Room.prototype.remoteMining = function () {
    if (this.controller.level <= 2) { return }


    let directExits = Game.map.describeExits(this.name)
    let remoteSources = [];
    let exits = [];

    for (let i in directExits) {
        exits.push(directExits[i])
    }

    // proces closest rooms first
    remoteSources = remoteSources.concat(
        this.memory.remoteSources.filter(function (s) {
            return exits.includes(s.roomName)
        })
    )
    remoteSources = remoteSources.concat(
        this.memory.remoteSources.filter(function (s) {
            return !exits.includes(s.roomName)
        })
    )

    if (this.energyAvailable >  config.Roles.filter(function (r) { return r.roleName == Role.HARVESTER })[0].maxBodyCost
        && !this.findMainSpawns().isBusy()
        && this.isHealthy()
        && (this.storageReserve() > this.creepsInRole(Role.HARVESTER) * this.energyCapacityAvailable
            || this.heathyStorageReserve()
        )
    ) {

        for (i in remoteSources) {
            let pos = new RoomPosition(this.memory.remoteSources[i].x, this.memory.remoteSources[i].y, this.memory.remoteSources[i].roomName)
            /** create worker creep */
            let c = _(Game.creeps).filter(
                {
                    memory: {
                        role: 'harvester'
                        , remoteSource: {
                            x: pos.x,
                            y: pos.y,
                            roomName: pos.roomName
                        }
                    }
                }).value().length;
            if (c < pos.fnNoOfCreepsRequired()) {
                this.log("Creep doesnt exists for " + pos.toString(), LogLevel.DEBUG)
                let opt = {
                    Memory: { remoteSource: pos }
                }
                spawnCreep(Role.HARVESTER, this, opt)
                return
            }

            //     /** create a guardian */
            //     if (c > 2 || c == pos.fnNoOfCreepsRequired()) {
            //         let g = _(Game.creeps).filter(
            //             {
            //                 memory: {
            //                     role: Role.GUARDIAN
            //                     , guardRoom: pos.roomName
            //                 }

            //             }).value().length;

            //         if (g <= 0) {
            //             let opt = {
            //                 Memory: { guardRoom: pos.roomName }
            //                 ,maxBodySize: 670
            //             }
            //             spawnCreep(Role.GUARDIAN, this, opt)
            //             return
            //         }

            //     }
        }
    }
}