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
        Creep: "",
        StructureSpawn: "",
    },

    Creep: {
        Renew: {
            Allow: true,
            UpTo: 3000,
            AtSameTime: 1,
            TickBeforeRetry: 60,
            LastHopeProtocol: 10, // will recycle if less and this and no energy at swan 
        },
        Harvesting: {
            Drained:{
                WaitIfTickLessThen: 20
            }
        },
    },






    Roles: [
        {
            roleName: "harvester",
            tickBeforeReview: 60,
            renewAt: 500,
            enforeMaxNoOfCreepReviewAtOnce: true,
            overRideReviewAtOnceIfLiveLessThen: 300
        },
        {
            roleName: "upgrader",
            tickBeforeReview: 60,
            renewAt: 500,
            enforeMaxNoOfCreepReviewAtOnce: true,
            overRideReviewAtOnceIfLiveLessThen: 300
        },
        {
            roleName: "builder",
            tickBeforeReview: 60,
            renewAt: 500,
            enforeMaxNoOfCreepReviewAtOnce: true,
            overRideReviewAtOnceIfLiveLessThen: 300
        },
        {
            roleName: "miner",
            tickBeforeReview: 100,
            renewAt: 500,
            enforeMaxNoOfCreepReviewAtOnce: true,
            overRideReviewAtOnceIfLiveLessThen: 300,
            maxbodyCost: 1050, // 10 * 100  (10 WORK, Cost 100) + 50 (MOVE, Cost 50) 
            autoSpawn: 1
        },
        {
            roleName: "carrier",
            tickBeforeReview: 60,
            renewAt: 600,
            enforeMaxNoOfCreepReviewAtOnce: true,
            overRideReviewAtOnceIfLiveLessThen: 300,
            autoSpawn: 2
        },
        {
            roleName: "LongRangeHarvester",
            tickBeforeReview: 1000,
            renewAt: 700,
            enforeMaxNoOfCreepReviewAtOnce: false,
            overRideReviewAtOnceIfLiveLessThen: 300
        },
        {
            roleName: "worker",
            tickBeforeReview: 60,
            renewAt: 500,
            enforeMaxNoOfCreepReviewAtOnce: true,
            overRideReviewAtOnceIfLiveLessThen: 300,
            repairStructuresAtHealthPercentage: 90, // Repair at this percetage
            autoSpawn: 4
        },
        {
            roleName: "upgrader",
            tickBeforeReview: 100,
            renewAt: 500,
            enforeMaxNoOfCreepReviewAtOnce: false,
            overRideReviewAtOnceIfLiveLessThen: 300
        }
    ],

    RoadNetwork: {
        ReviewEvery: 1000
    },
    Sources: {
        ReviewEvery: 1000,
        ReviewEveryOnFailure: 100,
    },

    Room: {
        Stages: {
            ReviewEvery: 100
        },
        Spawning:{
            Allow: true,
        },
        Tasks: [
            {
                Function: "roadNetwork",
                ReviewEvery: 1000,
                ReviewEveryOnFailure: 100,
            },
            {
                Function: "buildSourceContainer",
                ReviewEvery: 200,
                ReviewEveryOnFailure: 10,
            },
            {
                Function: "buildControllerContainer",
                ReviewEvery: 200,
                ReviewEveryOnFailure: 10,
            },
            {
                Function: "checkCreepForControllerContainer",
                ReviewEvery: 200,
                ReviewEveryOnFailure: 10,
            },
        ]
    }
}



