import * as THREE from 'three';
import { TeapotGeometry } from '../js/TeapotGeometry';

import sunTexture from '../imgs/sun.jpg';

const textureLoader = new THREE.TextureLoader();

class Ring extends THREE.Mesh {
    constructor (radius, tube, posX, posY, posZ, velocity, color=0xffff00) {
        super(
            new THREE.TorusGeometry(radius, tube, 30),
            new THREE.MeshPhongMaterial({ color: color })
        );

        this.radius = radius;
        this.tube = tube;
        this.outRadius = radius + tube;

        this.position.set(posX, posY, posZ);

        this.velocity = velocity;
    }

    updateSides () {
        this.front = this.position.z + this.outRadius / 2;
        this.back = this.position.z - this.outRadius / 2;
        this.right = this.position.x + this.outRadius / 2;
        this.left = this.position.x - this.outRadius / 2;
        this.top = this.position.y + this.outRadius / 2;
        this.bottom = this.position.y - this.outRadius / 2;
    }

    move() {
        this.updateSides();
        this.rotateY(this.velocity);
        this.position.z -= this.velocity;
    }
}

// 0.3, 0.3, 0.1
// 0.5

class Teapot extends THREE.Mesh {
    constructor (size, posX, posY, posZ, velocity) {
        super(
            new THREE.TeapotGeometry(size),
            new THREE.MeshStandardMaterial({color: 'green'})
        )

        this.size = size;

        this.position.set(posX, posY, posZ);

        this.velocity = velocity;

        this.updateSides();
    }

    updateSides () {
        this.front = this.position.z + this.size / 2;
        this.back = this.position.z - this.size / 2;
        this.right = this.position.x + this.size / 2;
        this.left = this.position.x - this.size / 2;
        this.top = this.position.y + this.size / 2;
        this.bottom = this.position.y - this.size / 2;
    }

    move() {
        this.position.z -= this.velocity;
        this.updateSides();
    }
}

class SuperPowerUnit extends THREE.Mesh {
    constructor (radius, posX, posY, posZ, velocity) {
        super(
            new THREE.IcosahedronGeometry(radius),
            new THREE.MeshBasicMaterial({map: textureLoader.load(sunTexture)})
        )

        this.radius = radius;

        this.position.set(posX, posY, posZ);

        this.velocity = velocity;

        this.updateSides();
    }

    updateSides () {
        this.front = this.position.z + this.radius;
        this.back = this.position.z - this.radius;
        this.right = this.position.x + this.radius;
        this.left = this.position.x - this.radius;
        this.top = this.position.y + this.radius;
        this.bottom = this.position.y - this.radius;
    }

    move() {
        this.position.z -= this.velocity;
        this.updateSides();
    }
}

export { Ring, Teapot, SuperPowerUnit };