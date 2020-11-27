global.Command = class Command {

    static helloWorld()  {
        console.log("helloWorld");
        return;
    }

    static recycleCreep(creepName)  {
        let creep = _.filter(Game.creeps, {name: creepName});
        console.log(Memory.creeps[creepName])
        console.log(JSON.stringify(creep))
        Memory.creeps[creepName].recycle = true
        Memory.creeps[creepName].tickBeforeReview = 0 
        // creep.recycle()
        return console.log("Recycling " + creep);
    }
}