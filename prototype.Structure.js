Object.defineProperty(Structure.prototype, 'memory', {
  get: function () {
    if (Memory.structures === undefined) {
      Memory.structures = {};
    }
    if (Memory.structures[this.id] === undefined) {
      Memory.structures[this.id] = {};
    }
    return Memory.structures[this.id];
  },
  set: function (v) {
    _.set(Memory, 'structures.' + this.id, v);
  },
  configurable: true,
  enumerable: false,
});

Structure.prototype.getHealthPercentage = function () {
  return (this.hits / this.hitsMax);
};


Structure.prototype.getRepairAt = function () {
  
  let roomLvl = this.room.controller.level;
  /** look for setting for this level  */
  let c = config.Room.Repair.filter(
    function (c) {
      return c.Objects.includes(this.structureType) && c.RoomLevel == roomLvl
    }
  )[0]
  if (c) { return c.StartAt };

  console.log(this.room.controller.level)
  console.log(this.structureType)

  /** look for setting for level before  */
  c = config.Room.Repair.filter(
    function (c) {
      console.log( c.RoomLevel + '-' + roomLvl)
      return c.Objects.includes(this.structureType) && c.RoomLevel <= roomLvl
    }
  )[0]
  if (c) { return c.StartAt };


  return;
};



// RoomPosition.prototype.repairMe = function () {
//   return this.hits > ;
// };


// 10000000

// 0.0000001
// STRUCTURE_SPAWN  , STRUCTURE_EXTENSION  , STRUCTURE_ROAD  , STRUCTURE_WALL  
// , STRUCTURE_RAMPART  , STRUCTURE_KEEPER_LAIR  , STRUCTURE_PORTAL  , STRUCTURE_CONTROLLER 
//  , STRUCTURE_LINK  , STRUCTURE_STORAGE  , STRUCTURE_TOWER  , STRUCTURE_OBSERVER  
//  , STRUCTURE_POWER_BANK  , STRUCTURE_POWER_SPAWN  , STRUCTURE_EXTRACTOR  , STRUCTURE_LAB  
//  , STRUCTURE_TERMINAL  , STRUCTURE_CONTAINER  , STRUCTURE_NUKER  
//  , STRUCTURE_FACTORY  , STRUCTURE_INVADER_CORE