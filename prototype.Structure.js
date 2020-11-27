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
  return (this.hits / this.hitsMax) * 100;
};



Structure.prototype.getRepairConfig = function () {
  let roomLvl = this.room.controller.level;
  structureType = this.structureType;

  /** look for setting for this level  */
  let c = config.Room.Repair.filter(
    function (c) {
      return c.Objects.includes(structureType) && c.RoomLevel == roomLvl
    }
  )[0]
  if (c) { return c };

  /** look for setting for level before  */
  c = config.Room.Repair.filter(
    function (c) {
      return c.Objects.includes(structureType) && c.RoomLevel <= roomLvl
    }
  ).sort(function(a, b){return b.RoomLevel - a.RoomLevel})[0]
  if (c) { return c };

  /** look for setting for level before  */
  c = config.Room.Repair.filter(
    function (c) {
      return c.Objects.includes("all") && c.RoomLevel <= roomLvl
    }
  )[0]
  if (c) { return c };

  return {};
};

Structure.prototype.getRepairAt = function () {
  return this.getRepairConfig().StartAt;
};
Structure.prototype.getRepairUpTo = function () {
  return this.getRepairConfig().Upto;
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