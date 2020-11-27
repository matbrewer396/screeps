
Room.prototype.reconUpdate = function () {
    let r = new RoomReconData(this)
    r.save()

    // console.log("reconData:" + JSON.stringify(Memory.reconData))
    // console.log("reconRoomQueue:" + JSON.stringify(Memory.reconRoomQueue))
}

/**
 * Recon near by rooms and then mine if suitable
 */
Room.prototype.reconFromHere = function () {
    // Memory.reconData = []
    // Memory.reconRoomQueue = []

    RoomReconData.processRoom(this.name, 1)
    // console.log("reconData:" + JSON.stringify(Memory.reconData))
    // console.log("reconRoomQueue:" + JSON.stringify(Memory.reconRoomQueue))

    if (!Memory.reconData) {
        return
    }

    let rooms = Memory.reconData.filter(function name(d) {
        return !d.hasHostile
            && d.keeperLair.length == 0
            && (!d.controller|| (d.controller && !d.controller.owner ) )
    })
    let l = ""
    for (i in rooms) {
        for (j in rooms[i].sources){
            this.addRemoteSource(rooms[i].sources[j].pos)
        }
    }
}


class RoomReconData {
    /**
     * pass in json for existing 
     * @param {Room} room 
     * @param {string} json 
     */
    constructor(room, json) {
        if (!json) {
            this.lastUpdate = Game.time
            this.roomName = room.name
            this.controller = room.controller
            this.sources = room.find(FIND_SOURCES);
            this.hasHostile = room.isUnderAttack()
            this.keeperLair = room.findKeeperLair();
        } else {
            this.lastUpdate = json.lastUpdate
            this.roomName = json.roomName
            this.controller = json.controller
            this.sources = json.sources;
            this.hasHostile = json.hasHostile
            this.keeperLair = json.keeperLair
        }
    }


    save() {
        if (!Memory.reconData || typeof Memory.reconData !== "object") {
            Memory.reconData = new Array();
            Memory.reconData.push(this)
        } else if (RoomReconData.getRoom(this.roomName)) {
            RoomReconData.delete(this.roomName)
            Memory.reconData.push(this)
        } else {
            Memory.reconData.push(this)
        }
    }

    static delete(roomName) {
        Memory.reconData = Memory.reconData.filter(function (r) {
            return r.roomName !== roomName
        })

    }

    static getRoom(roomName) {
        let j = Memory.reconData.filter(function (r) {
            return r.roomName == roomName
        })[0]

        if (!j) {
            return undefined
        } else {
            let r = new RoomReconData(undefined, j)
            return r
        }


    }

    static hasBeen(roomName) {
        if(!Memory.reconData) {return false }
        return Memory.reconData.filter(function (r) {
            return r.roomName == roomName
        }).length > 0
    }


    // /**
    //  * 
    //  * @param {String} roomName 
    //  * @param {Integer} lvl 
    //  */
    static processRoom(roomName, lvl) {
        let myLvl = 1
        if (lvl) {
            myLvl = lvl + 1
        }
        else {
            myLvl = 1
        };
        // only search near by
        if (lvl > config.recon.searchLevel + 1) { return }
        if (lvl > 100) { return }
        // already been mapped
        if (RoomReconData.hasBeen(roomName)) { return }
        // init memory array
        if (!Memory.reconRoomQueue) { Memory.reconRoomQueue = [] }
        // already in queue
        if (Memory.reconRoomQueue.filter(r => r == roomName).length > 0) { return }
        // add to queue                
        Memory.reconRoomQueue.push(roomName)
        let exits = Game.map.describeExits(roomName)
        for (let i in exits) {
            RoomReconData.processRoom(exits[i], myLvl)
        }
    }

}

module.exports = RoomReconData;