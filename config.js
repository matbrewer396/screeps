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
        Creep: "RECON_2367", // MINER_3532
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
            Drained: {
                WaitIfTickLessThen: 20
            }
        },
        DropOff: {
            LastWithDrawExpiry: 20
        },
        Debug: {
            Visual: "fuchsia"
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
            maxBodyCost: 650, // 6 * 100  (10 WORK, Cost 100) + 50 (MOVE, Cost 50) 
        },
        {
            roleName: "carrier",
            tickBeforeReview: 60,
            renewAt: 600,
            enforeMaxNoOfCreepReviewAtOnce: true,
            overRideReviewAtOnceIfLiveLessThen: 300,
        },
        {
            roleName: "worker",
            tickBeforeReview: 60,
            renewAt: 300,
            enforeMaxNoOfCreepReviewAtOnce: true,
            overRideReviewAtOnceIfLiveLessThen: 300,
            repairStructuresAtHealthPercentage: 90, // Repair at this percetage
        },
        {
            roleName: Role.GUARDIAN,
            tickBeforeReview: 60,
            renewAt: 500,
            enforeMaxNoOfCreepReviewAtOnce: true,
            overRideReviewAtOnceIfLiveLessThen: 300
        },
        {
            roleName: Role.RECON,
            tickBeforeReview: 60,
            renewAt: 0,
            enforeMaxNoOfCreepReviewAtOnce: true,
            overRideReviewAtOnceIfLiveLessThen: 300
        },

        

    ],




    RoadNetwork: {
        Build: false,
    },
    Sources: {
        ReviewEvery: 1000,
        ReviewEveryOnFailure: 100,
    },
    recon: {
        searchLevel: 2
    },

    Repair: {

    },
    // Storage: {
    //     WithDrawLimit: {
    //         lvl:
    //     }
    // }

    Room: {
        HeathyStorageReserve: {
            1:20000,
            2:20000,
            3:20000,
            4:20000,
            5:20000,
            6:40000,
            7:80000,
            8:160000,
        },
        Stages: {
            ReviewEvery: 100
        },
        Spawning: {
            Allow: true,
        },
        Tasks: [
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
        //STRUCTURE_SPAWN  , STRUCTURE_EXTENSION  , STRUCTURE_ROAD  , STRUCTURE_WALL  , STRUCTURE_RAMPART  , STRUCTURE_KEEPER_LAIR  , STRUCTURE_PORTAL  , STRUCTURE_CONTROLLER  , STRUCTURE_LINK  , STRUCTURE_STORAGE  , STRUCTURE_TOWER  , STRUCTURE_OBSERVER  , STRUCTURE_POWER_BANK  , STRUCTURE_POWER_SPAWN  , STRUCTURE_EXTRACTOR  , STRUCTURE_LAB  , STRUCTURE_TERMINAL  , STRUCTURE_CONTAINER  , STRUCTURE_NUKER  , STRUCTURE_FACTORY  , STRUCTURE_INVADER_CORE
        Repair: [
            {
                Objects: [STRUCTURE_CONTAINER, STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_ROAD, STRUCTURE_TOWER],
                RoomLevel: 1,
                Upto: 100,
                StartAt: {
                    Tower: 100,
                    Creep: 90,
                }

            },
            {
                //1 hit ramp(10,000,000) 0.0000001, 30 hit wall(300,000,00) 0.0000001 
                Objects: [STRUCTURE_WALL, STRUCTURE_RAMPART],
                RoomLevel: 1,
                Upto: 25,
                StartAt: {
                    Tower: 0.001, // 10k
                    Creep: 0.0008, // 8k
                }

            },


        ]


    },
    Planner: {
        ShowAll: true,
        Visual: {
            Road: "navy",
            Tower: "olive",
            Store: "yellow",
            Extension: "aqua",
            Container: "lime",

            road: "navy",
            tower: "olive",
            storage: "yellow",
            extension: "aqua",
            container: "lime",
        },
        BuildCross: {
            Enabled: true,
            RoadLength: 12,
        },
        MaxLevel: 5

    }


}



// 3-4	1 tower
// 5-6	2 towers
// 7	3 towers
// 8	6 towers

// 2	5 extensions (50 capacity)
// 3	10 extensions (50 capacity)
// 4	20 extensions (50 capacity)
// 5	30 extensions (50 capacity)
// 6	40 extensions (50 capacity)
// 7	50 extensions (100 capacity)
// 8	60 extensions (200 capacity)