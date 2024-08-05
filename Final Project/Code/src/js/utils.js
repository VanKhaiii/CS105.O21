const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const randomWithProbability = (options) => {
    // Example usage
    // const options = [
    //     { value: "Item", weight: 3 }, // 30% chance
    //     { value: "Obstacle", weight: 2 }, // 20% chance
    //     { value: "Nothing", weight: 5 }, // 50% chance
    // ];

    let totalWeight = 0;
    for (const option of options) {
        totalWeight += option.weight;
    }

    const randomWeight = Math.random() * totalWeight;
    let accumulatedWeight = 0;

    for (const option of options) {
        accumulatedWeight += option.weight;
        if (randomWeight <= accumulatedWeight) {
            return option.value;
        }
    }
};

export { randomInt, randomWithProbability };