import {BoxObstacle, SphereObstacle, ConeObstacle, CylinderObstacle} from './Obstacles.js'
import {Ring, Teapot, SuperPowerUnit} from './Items.js'
import { randomInt, randomWithProbability } from './utils.js'

class WallManager {
    constructor () {
        this.obstacles = [];
        this.items = [];
        this.wallProbs = [
            {value: "cylinder", weight: 3},
            {value: "sphere", weight: 3},
            {value: "cone", weight: 3},
            {value: "teapot", weight: 0.5},
            {value: "superpower", weight: 0.5},
        ];

        this.invalidZ = -20;
        this.startZ = 30;

        this.lowY = 2;
        this.highY = 5;

        this.fastV = 0.4; 
        this.slowV = 0.3;

        this.coneRadius = 1.3;
        this.cylinderRadius = 1.5;
        this.cylinderHeight = 12;
        this.boxSize = 3;
        this.sphereRadius = 4;
        this.ringRadius = 0.5;
        this.tube = 0.2
        this.teapotSize = 0.6;
        this.supPowRadius = 1;

        this.isWire = false;
        this.isMesh = true;
    }

    setMode (mode) {
        if (mode === "teapot") {
            this.isWire = true;
            this.isMesh = true;
        }
        else if (mode === "superpower") {
            this.isWire = false;
            this.isMesh = false;
        }
        else {
            this.isWire = false;
            this.isMesh = true;
        }
    }

    generateSphereWall () {
        // Main obstacle: sphere, minor obstacles: cone, cube
        // Put sphere
        const rdPos = randomInt(0, 1) ? 2 : -2;
        this.obstacles.push(
            new SphereObstacle(this.sphereRadius, rdPos, this.startZ, this.slowV, this.isWire, this.isMesh)
        )

        // Put cone, cube
        const type = randomInt(0, 2);

        if (type == 0) { // 2 Rings
            this.items.push(
                new Ring(
                    this.ringRadius, this.tube, 
                    rdPos + (rdPos < 0 ? 6 : -6), this.highY, this.startZ, 
                    this.slowV),
                new Ring(this.ringRadius, this.tube, rdPos + (rdPos < 0 ? 6 : -6), this.lowY, this.startZ, this.slowV),
            )
        }
        else if (type == 1) { // 1 Ring, 1 cube
            this.items.push(
                new Ring(this.ringRadius, this.tube, rdPos + (rdPos < 0 ? 6 : -6), this.highY, this.startZ, this.slowV),
            )

            this.obstacles.push(
                new BoxObstacle(this.boxSize, this.boxSize, this.boxSize, rdPos + (rdPos < 0 ? 6 : -6), this.startZ, this.slowV, this.isWire, this.isMesh)
            );
        }
        else { // 1 Ring, 1 cone
            this.items.push(
                new Ring(this.ringRadius, this.tube, rdPos + (rdPos < 0 ? 6 : -6), this.lowY, this.startZ, this.slowV),
            )

            this.obstacles.push(
                new ConeObstacle(this.coneRadius, 4, rdPos + (rdPos < 0 ? 6 : -6), this.startZ, this.slowV, this.isWire, this.isMesh)
            );
        }
    }

    generateCylinderWall () {
        // Main obstacle: long cylinder; minor obstacles: cones
        this.obstacles.push(new CylinderObstacle(this.cylinderRadius, this.cylinderHeight, 0, this.startZ, this.slowV, this.isWire, this.isMesh));

        const type = randomInt(0, 2);
        
        switch (type) {
            case 0: // 3 Rings
                this.items.push(
                    new Ring(this.ringRadius, this.tube, 0, this.highY, this.startZ, this.slowV),
                    new Ring(this.ringRadius, this.tube, -4, this.highY, this.startZ, this.slowV),
                    new Ring(this.ringRadius, this.tube, 4, this.highY, this.startZ, this.slowV),
                )

                break;

            case 1: // 2 Rings with 1 cone at middle
                this.items.push(
                    new Ring(this.ringRadius, this.tube, -4, this.highY, this.startZ, this.slowV),
                    new Ring(this.ringRadius, this.tube, 4, this.highY, this.startZ, this.slowV),
                )

                this.obstacles.push(
                    new ConeObstacle(this.coneRadius, 4, 0, this.startZ, this.slowV, this.isWire, this.isMesh),
                )
                
                break;

            default: // 1 Ring at middle and 2 cones
                this.items.push(
                    new Ring(this.ringRadius, this.tube, 0, this.highY, this.startZ, this.slowV),
                )

                this.obstacles.push(
                    new ConeObstacle(this.coneRadius, 4, -4, this.startZ, this.slowV, this.isWire, this.isMesh),
                    new ConeObstacle(this.coneRadius, 4, 4, this.startZ, this.slowV, this.isWire, this.isMesh),
                )
        } 
    }

    generateConeWall () {
        // Main obstacles: 3 cones; Minor obstacles: cube
        this.obstacles.push(
            new ConeObstacle(this.coneRadius, 4, 0, this.startZ, this.slowV, this.isWire, this.isMesh),
            new ConeObstacle(this.coneRadius, 4, -4, this.startZ, this.slowV, this.isWire, this.isMesh),
            new ConeObstacle(this.coneRadius, 4, 4, this.startZ, this.slowV, this.isWire, this.isMesh),
        )

        const type = randomInt(0, 2);

        switch (type) {
            case 0: // 3 Rings
                this.items.push(
                    new Ring(this.ringRadius, this.tube, 0, this.lowY, this.startZ, this.slowV),
                    new Ring(this.ringRadius, this.tube, -4, this.lowY, this.startZ, this.slowV),
                    new Ring(this.ringRadius, this.tube, 4, this.lowY, this.startZ, this.slowV),
                )

                break;

            case 1: // 2 Rings, 1 cube
                this.items.push(
                    new Ring(this.ringRadius, this.tube, 0, this.lowY, this.startZ, this.slowV),
                    new Ring(this.ringRadius, this.tube, 4, this.lowY, this.startZ, this.slowV),
                )

                this.obstacles.push(
                    new BoxObstacle(this.boxSize, this.boxSize, this.boxSize, -4, this.startZ, this.slowV, this.isWire, this.isMesh),
                )

                break;
                
            default: // 1Rings, 2 cubes
                this.items.push(
                    new Ring(this.ringRadius, this.tube, -4, this.lowY, this.startZ, this.slowV),
                )

                this.obstacles.push(
                    new BoxObstacle(this.boxSize, this.boxSize, this.boxSize, 0, this.startZ, this.slowV, this.isWire, this.isMesh),
                    new BoxObstacle(this.boxSize, this.boxSize, this.boxSize, 4, this.startZ, this.slowV, this.isWire, this.isMesh),
                )
        }
    }

    generateTeapotWall () {
        this.obstacles.push(
            new BoxObstacle(4, 4, 4, 0, this.startZ, this.fastV, this.isWire, this.isMesh),
            new ConeObstacle(this.coneRadius, 5, 3, this.startZ, this.fastV, this.isWire, this.isMesh),
            new ConeObstacle(this.coneRadius, 5, -3, this.startZ, this.fastV, this.isWire, this.isMesh),
        )

        this.items.push(
            new Ring(this.ringRadius, this.tube, -4, this.lowY, this.startZ, this.fastV),
            new Ring(this.ringRadius, this.tube, 4, this.lowY, this.startZ, this.fastV),
            new Teapot(this.teapotSize, 0, this.highY, this.startZ, this.fastV),
        )
    }

    generatePowerUnitWall () {
        this.obstacles.push(
            new BoxObstacle(3, 8, 3, 4, this.startZ, this.fastV, this.isWire, this.isMesh),
            new BoxObstacle(3, 8, 3, -4, this.startZ, this.fastV, this.isWire, this.isMesh),
            new SphereObstacle(2, 0, this.startZ * 1.25, this.slowV * 2, this.isWire, this.isMesh),
        )

        this.items.push(
            new SuperPowerUnit(this.supPowRadius, 0, this.highY, this.startZ, this.fastV),
        )
    }

    generateWall(scene) {
        // Pick randomly one obstacle type (in 4 types) to put into map
        const wallType = randomWithProbability(this.wallProbs);
        
        switch (wallType) {
            case 'cylinder':
                this.generateCylinderWall(scene);
                break;

            case 'sphere': 
                this.generateSphereWall(scene);
                break;

            case 'cone': 
                this.generateConeWall(scene);
                break;
                
            case 'teapot': 
                this.generateTeapotWall(scene);
                break;
            case 'superpower':
                this.generatePowerUnitWall(scene);
                break;

            default:
                console.log('Wall not exist');
        }

        for (let obs of this.obstacles) {
            obs.body.castShadow = true;
            scene.add(obs.body);
        }

        for (let item of this.items) {
            item.castShadow = true;
            scene.add(item);
        }
    }

    removeInvalObjs (scene, characterController) {
        // Remove invalid obstacles: out of ground
        this.obstacles = this.obstacles.filter((obs) => {
            if (obs.body.position.z >= this.invalidZ)
                return true;
            else {
                const removedObs = scene.getObjectById(obs.body.id);
                scene.remove(removedObs);
                return false;
            }
        });
        
        // Remove invalid items: out of ground, or collected by character
        this.items = this.items.filter((item) => {
            if (item.position.z < this.invalidZ || characterController.checkItemPickup(item)) {
                const rmItem = scene.getObjectById(item.id);
                scene.remove(rmItem);
                return false;
            }

            return true;
        });
    }

    update () {
        this.obstacles.forEach((obs) => {
            obs.move();
        })

        this.items.forEach((item) => {
            item.move(); 
        });
    }

    
}

export { WallManager };