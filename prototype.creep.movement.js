Creep.prototype.checkPos = function () {
    if (this.pos.isBoarder(-1)){
        this.log("is on boarder")
        if(this.pos.x == 0) {
            this.move(RIGHT);
        } else if(this.pos.x == 49) {
            this.move(LEFT);
        } else if(this.pos.y == 0) {
            this.move(BOTTOM);
        } else if(this.pos.y == 49) {
            this.move(TOP);
        }
    }
}



Creep.prototype.moveToRoom = function (room) {
    if (this.pos.roomName !== room || this.pos.isBoarder(-1)) {
        let target = new RoomPosition(25, 25, room);
        let r = this.moveTo(target)
        this.log("MoveToRoom: " + room + "; OutCome: " + r, LogLevel.DEBUG)
    } else {
        return false;
    }

}