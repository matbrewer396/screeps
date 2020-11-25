Room.prototype.plan = function () {
    /**
     * Planner 
     * Tower and store
     * extension 
     */
    let aroundSpawn = this.findMainSpawns().pos.getNearByBuildablePositions();
    let storeSite = this.memory.storeSite;
    let towerSite = undefined;
    var processedPos = [];
    var subPosition = [];

    if (config.Planner.BuildCross.Enabled){
        roadAtPositions(this.findMainSpawns().pos.getAdjacentPositionsInDirection(Direction.NORTH, config.Planner.BuildCross.RoadLength), this)
        roadAtPositions(this.findMainSpawns().pos.getAdjacentPositionsInDirection(Direction.SOUTH, config.Planner.BuildCross.RoadLength), this)
        roadAtPositions(this.findMainSpawns().pos.getAdjacentPositionsInDirection(Direction.WEST, config.Planner.BuildCross.RoadLength), this)
        roadAtPositions(this.findMainSpawns().pos.getAdjacentPositionsInDirection(Direction.EAST, config.Planner.BuildCross.RoadLength), this)
    }
   
    
    for (i in aroundSpawn){
        this.visual.circle(aroundSpawn[i], {fill: 'transparent', radius: 0.45, stroke: 'red'})
        processPositions(aroundSpawn[i].getNearByBuildablePositions(),this, 0);
        
    }
    function processPositions(positions, room, lvl){
        if (lvl > config.Planner.MaxLevel){
            return
        }
        for (j in positions){
            processPosition(positions[j], room, lvl)
        }
    }

    function processPosition(pos, room){
        /** Remove any site taken
         */
        if (pos.hasRoad() 
            || pos.hasConstructionSite()
            || pos.hasStructure() 
            || processedPos.filter(function(p){ return p.x == pos.x && p.y == pos.y }).length > 0
        ) {
            return
        }
        let colour = "green";

        if (!towerSite){
            towerSite = pos;
            colour = config.Planner.Visual.Tower;
            roadAtPositions(pos.getNearByBuildablePositions(), room)
        } else if (!storeSite){
            storeSite = pos;
            roadAtPositions(pos.getNearByBuildablePositions(), room)
            colour = config.Planner.Visual.Store;
        } else if (pos.isNextToRoad()) {
            colour = config.Planner.Visual.Extension;
        } 

        
        processedPos.push(pos)
        room.visual.circle(pos, {fill: 'transparent', radius: 0.45, stroke: colour})
    }

    function roadAtPositions(positions, room){
        for (i in positions){
            let pos = positions[i]
            if (pos.hasRoad() 
                || pos.hasConstructionSite()
                || pos.hasStructure() ) 
            {
                continue
            }
            processedPos.push(pos)
            room.visual.circle(pos, {fill: 'transparent', radius: 0.45, stroke: config.Planner.Visual.Road})
            //processPositions(pos.getNearByBuildablePositions(), room, 1 )
        }
    }
 
}