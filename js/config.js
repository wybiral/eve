const CONFIG = {
    entities: {
        // max health of entity (1 green pixel restores this much)
        maxHealth: 150,
        // if true fertilization requires a different parent entity
        requireMate: false,
        // green pixels required to spawn egg
        eggCost: 2,
        // green pixels required to fertilize egg
        fertilizationCost: 1,
    },
    environment: {
        width: 2000,
        height: 2000,
        islands: {
            count: 40,
            minRadius: 10,
            maxRadius: 150,
        },
        redDensity: 0.1,
        greenDensity: 0.1,
        yellowDensity: 0.01,
    },
    mutationRates: {
        swapLayers: 0.0001,
        changeInput: 0.0001,
        changeOutput: 0.0001,
        randomizeWeight: 0.001,
        adjustWeight: 0.001,
    }
};
