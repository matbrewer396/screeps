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
        Creep: "", // MINER_3532
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
        DropOff:{
            LastWithDrawExpiry: 20
        },
        Debug:{
            Visual:"fuchsia"
        }
    },






    Roles: [
        {
            roleName: "harvester",
            tickBeforeReview: 600, // should every auto review
            renewAt: 500,
            enforeMaxNoOfCreepReviewAtOnce: true,
            overRideReviewAtOnceIfLiveLessThen: 300,
            dropOffAtStorage: true,
            dropOffAtUpgradeContainer: true,
            pickUpDroppedInRange: 10,
            harvestSourceWithInRange: 10, // this creep has to room pos and then finds sources within this range 
            noSourcesReturnHomeLessThenFree: 100,
            blockSpawnRetryLater: true,
            upgradeIfStorageOver: 200000
        },
        {
            roleName: "upgrader",
            tickBeforeReview: 60,
            renewAt: 0,
            enforeMaxNoOfCreepReviewAtOnce: true,
            overRideReviewAtOnceIfLiveLessThen: 300
        },
        {
            roleName: "miner",
            tickBeforeReview: 100,
            renewAt: 200,
            enforeMaxNoOfCreepReviewAtOnce: true,
            overRideReviewAtOnceIfLiveLessThen: 300,
            maxbodyCost: 650, // 6 * 100  (10 WORK, Cost 100) + 50 (MOVE, Cost 50) 
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
            roleName: "worker",
            tickBeforeReview: 60,
            renewAt: 300,
            enforeMaxNoOfCreepReviewAtOnce: true,
            overRideReviewAtOnceIfLiveLessThen: 300,
            repairStructuresAtHealthPercentage: 90, // Repair at this percetage
            autoSpawn: 2
        },
        {
            roleName: Role.GUARDIAN,
            tickBeforeReview: 60,
            renewAt: 500,
            enforeMaxNoOfCreepReviewAtOnce: true,
            overRideReviewAtOnceIfLiveLessThen: 300
        }
    ],

    RoadNetwork: {
        Build: false,
    },
    Sources: {
        ReviewEvery: 1000,
        ReviewEveryOnFailure: 100,
    },
    // Storage: {
    //     WithDrawLimit: {
    //         lvl:
    //     }
    // }

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
                ReviewEvery: 20,
                ReviewEveryOnFailure: 10,
            },
            {
                Function: "buildControllerContainer",
                ReviewEvery: 100,
                ReviewEveryOnFailure: 10,
                Build: true,
            },
            {
                Function: "checkCreepForControllerContainer",
                ReviewEvery: 1,
                ReviewEveryOnFailure: 1,
            },
        ],
        
    }, 
    Planner: {
        Visual: {
            Road: "navy",
            Tower: "olive",
            Store: "yellow",
            Extension: "aqua",
            Container: "lime",
        },
        BuildCross:{
            Enabled: true,
            RoadLength: 6,
        },
        MaxLevel: 5
        
    }


}



