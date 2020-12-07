global.Military = class Military {
    /**
     * Military.rapidResponseRequest(roomName)
     * @param {string} roomName 
     */
    static rapidResponseRequest(roomName) {
        logger("rapidResponseRequest", LogLevel.DEBUG, "Military", {name:roomName});
        if (!Memory.rapidResponseGuardianQueue.includes(roomName)) {
            logger("rapidResponseRequest - not in queue", LogLevel.DEBUG, "Military", {name:roomName});
            let r = Game.rooms[roomName];
            if (r) {
                // room visible
                if (r.isHostileOwn()) {
                    logger("rapidResponseRequest - room not suitable", LogLevel.DEBUG, "Military", {name:roomName});
                    return false
                }
            }

            logger("rapidResponseRequest - adding to queue", LogLevel.DEBUG, "Military", {name:roomName});
            Memory.rapidResponseGuardianQueue.push(roomName)
            return true
        }

    }

    // static roomContested(roomName) {
    //     if (!Memory.contestedRoom) { Memory.contestedRoom =[] }

    // }
 


}
