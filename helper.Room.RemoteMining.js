Room.prototype.remoteMining = function () {
    if (this.controller.level <= 2 ) { return }

    //    // TODO automate this
    //    this.addRemoteSource(new RoomPosition(34, 20, "W8N3"))
    //    this.addRemoteSource(new RoomPosition(30, 21, "W8N3"))
    //    this.addRemoteSource(new RoomPosition(4, 12, "W8N2"))
    //    this.addRemoteSource(new RoomPosition(21, 43, "W8N2"))
    //    this.addRemoteSource(new RoomPosition(43, 31, "W7N2"))
    //    this.addRemoteSource(new RoomPosition(23, 34, "W7N2"))
    //    this.addRemoteSource(new RoomPosition(41, 46, "W7N4"))
    //    this.addRemoteSource(new RoomPosition(12, 31, "W7N4"))
    //    this.addRemoteSource(new RoomPosition(7, 43, "W6N3"))
    //    this.addRemoteSource(new RoomPosition(28, 20, "W6N3"))

       
    if (this.energyAvailable == this.energyCapacityAvailable
        && !this.findMainSpawns().isBusy()
        && this.isHealthy()
        && (!this.storage && (
             this.storage.store[RESOURCE_ENERGY] > this.creepsInRole(Role.HARVESTER) * this.energyCapacityAvailable)
             || this.heathyStorageReserve() + 2000
            )
    ) {
        for (i in this.memory.remoteSources) {
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

            }

            /** create a guardian */
            if (c > 2 || c == pos.fnNoOfCreepsRequired()) {
                let g = _(Game.creeps).filter(
                    {
                        memory: {
                            role: Role.GUARDIAN
                            , guardRoom: pos.roomName
                        }
                        
                    }).value().length;

                if (g <= 0) {
                    let opt = {
                        Memory: { guardRoom: pos.roomName }
                        ,maxBodySize: 670
                    }
                    spawnCreep(Role.GUARDIAN, this, opt)
                    return
                }

            }
        }
    }
}