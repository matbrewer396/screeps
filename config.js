global.config = {
    /* Logging
    */
    LogLevel: {
        Room: LogLevel.NOTHING,
        Creep: LogLevel.NOTHING,
        StructureSpawn: LogLevel.NOTHING,
    },
    LogOverRide: {
        Room: "",
        Creep: "WORKER_6568",
        StructureSpawn: "",
    },




    
    Creep: {
        Renew: {
            Allow: true,
            UpTo: 3000,
            AtSameTime: 1
        },
    },






    Roles: [
        {
            roleName: "harvester",
            tickBeforeRenew: 60,
            renewAt: 500,
            enforeMaxNoOfCreepReviewAtOnce: true,
            overRideReviewAtOnceIfLiveLessThen: 300
        },
        {
            roleName: "upgrader",
            tickBeforeRenew: 60,
            renewAt: 500,
            enforeMaxNoOfCreepReviewAtOnce: true,
            overRideReviewAtOnceIfLiveLessThen: 300
        },
        {
            roleName: "builder",
            tickBeforeRenew: 60,
            renewAt: 500,
            enforeMaxNoOfCreepReviewAtOnce: true,
            overRideReviewAtOnceIfLiveLessThen: 300
        },
        {
            roleName: "miner",
            tickBeforeRenew: 100,
            renewAt: 500,
            enforeMaxNoOfCreepReviewAtOnce: true,
            overRideReviewAtOnceIfLiveLessThen: 300,
            maxbodyCost: 1050 // 10 * 100  (10 WORK, Cost 100) + 50 (MOVE, Cost 50) 
        },
        {
            roleName: "carrier",
            tickBeforeRenew: 60,
            renewAt: 500,
            enforeMaxNoOfCreepReviewAtOnce: true,
            overRideReviewAtOnceIfLiveLessThen: 300,
            autoSpawn: 2
        },
        {
            roleName: "LongRangeHarvester",
            tickBeforeRenew: 1000,
            renewAt: 700,
            enforeMaxNoOfCreepReviewAtOnce: false,
            overRideReviewAtOnceIfLiveLessThen: 300
        },
        {
            roleName: "worker",
            tickBeforeRenew: 60,
            renewAt: 500,
            enforeMaxNoOfCreepReviewAtOnce: true,
            overRideReviewAtOnceIfLiveLessThen: 300,
            repairStructuresAtHealthPercentage: 90, // Repair at this percetage
            autoSpawn: 6
        },
        {
            roleName: "upgrader",
            tickBeforeRenew: 100,
            renewAt: 500,
            enforeMaxNoOfCreepReviewAtOnce: false,
            overRideReviewAtOnceIfLiveLessThen: 300
        }
    ],

    RoadNetwork: {
        RenewEvery: 1000
    },
    Sources: {
        RenewEvery: 1000,
        RenewEveryOnFailure: 100,
    },

    Room: {
        Stages: {
            RenewEvery: 100
        },
        Spawning:{
            Allow: true,
        },
        Tasks: [
            {
                Function: "roadNetwork",
                RenewEvery: 1000,
                RenewEveryOnFailure: 100,
            },
            {
                Function: "buildSourceContainer",
                RenewEvery: 20,
                RenewEveryOnFailure: 10,
            },
        ]
    }
}



