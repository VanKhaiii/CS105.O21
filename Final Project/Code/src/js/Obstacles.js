import * as THREE from 'three';

import mercuryTexture from '../imgs/mercury.jpg';
import venusTexture from '../imgs/venus.jpg';
import earthTexture from '../imgs/earth.jpg';
import marsTexture from '../imgs/mars.jpg';
import jupiterTexture from '../imgs/jupiter.jpg';
import saturnTexture from '../imgs/saturn.jpg';
import uranusTexture from '../imgs/uranus.jpg';
import neptuneTexture from '../imgs/neptune.jpg';
import plutoTexture from '../imgs/pluto.jpg';

import { randomInt } from './utils';

// ============ Util functions ============
const textureLoader = new THREE.TextureLoader()

const defaultTextures = [
    mercuryTexture,
    venusTexture,
    earthTexture,
    marsTexture,
    jupiterTexture,
    saturnTexture,
    uranusTexture,
    neptuneTexture,
    plutoTexture
]

const defaultColors = [
    0xffffff,
    0xff0000,
    0x00ff00,
    0x0000ff,
    0xffff00,
    0x00ffff,
    0xff00ff,
]

const getRandomColor = () => defaultColors[randomInt(0, defaultColors.length - 1)];

const getRandomTexture = () => defaultTextures[randomInt(0, defaultTextures.length - 1)];

// ============== Classes ===============
export class BoxObstacle {
    constructor(
        width, height, depth,
        posX, posZ, velocity,
        isWire=false, isMesh=true,
        texture, color
    ) {
        if (isMesh) {
            this.body = new THREE.Mesh(
                new THREE.BoxGeometry(width, height, depth, 10, 10, 10),
                new THREE.MeshStandardMaterial({
                    map: texture ? texture : textureLoader.load(getRandomTexture()),
                    wireframe: isWire,
                    // color: color,
                })
            )
        }
        else {
            this.body = new THREE.Points(
                new THREE.BoxGeometry(width, height, depth, 10, 10, 10),
                new THREE.PointsMaterial({
                    // map: texture ? texture : textureLoader.load(getRandomTexture()),
                    color: color ? color : getRandomColor(),
                    size: 0.2,
                })
            )
        }

        this.body.position.set(posX, height / 2, posZ);
        this.velocity = velocity;
    }

    move () {
        this.body.position.z -= this.velocity;
    }
}


export class CylinderObstacle {
    constructor(
        radius, height,
        posX, posZ, velocity,
        isWire=false, isMesh=true,
        texture, color
    ) {
        if (isMesh) {
            this.body = new THREE.Mesh(
                new THREE.CylinderGeometry(radius, radius, height, 20),
                new THREE.MeshStandardMaterial({
                    map: texture ? texture : textureLoader.load(getRandomTexture()),
                    wireframe: isWire,
                    // color: color,
                })
            )
        }
        else {
            this.body = new THREE.Points(
                new THREE.CylinderGeometry(radius, radius, height, 20),
                new THREE.PointsMaterial({
                    // map: texture ? texture : textureLoader.load(getRandomTexture()),
                    color: color ? color : getRandomColor(),
                    size: 0.2,
                })
            )
        }

        this.body.position.set(posX, radius, posZ);
        this.radius = radius;
        this.body.rotateZ(Math.PI * 0.5);
        this.velocity = velocity;
    }

    move () {
        this.body.rotateY(2 * this.velocity / this.radius);
        this.body.position.z -= this.velocity;
    }
}

export class SphereObstacle {
    constructor (
        radius,
        posX, posZ, velocity,
        isWire=false, isMesh=true,
        texture, color
    ) {
        if (isMesh) {
            this.body = new THREE.Mesh(
                new THREE.SphereGeometry(radius, 20, 20),
                new THREE.MeshStandardMaterial({
                    map: texture ? texture : textureLoader.load(getRandomTexture()),
                    wireframe: isWire,
                    // color: color,
                })
            )
        }
        else {
            this.body = new THREE.Points(
                new THREE.SphereGeometry(radius, 20, 20),
                new THREE.PointsMaterial({
                    // map: texture ? texture : textureLoader.load(getRandomTexture()),
                    color: color ? color : getRandomColor(),
                    size: 0.2,
                })
            )
        }

        this.body.position.set(posX, radius, posZ);
        this.radius = radius;
        this.velocity = velocity;
    }

    move () {
        this.body.rotateX(- 2 * this.velocity / this.radius);
        this.body.position.z -= this.velocity;
    }
}

export class ConeObstacle {
    constructor (
        radius, height,
        posX, posZ, velocity,
        isWire=false, isMesh=true,
        texture, color
    ) {
        if (isMesh) {
            this.body = new THREE.Mesh(
                new THREE.ConeGeometry(radius, height, 20, 20),
                new THREE.MeshStandardMaterial({
                    map: texture ? texture : textureLoader.load(getRandomTexture()),
                    wireframe: isWire,
                    // color: color,
                })
            )
        }
        else {
            this.body = new THREE.Points(
                new THREE.ConeGeometry(radius, height, 20, 20),
                new THREE.PointsMaterial({
                    // map: texture ? texture : textureLoader.load(getRandomTexture()),
                    color: color ? color : getRandomColor(),
                    size: 0.2,
                })
            )
        }

        this.body.position.set(posX, radius * 4, posZ);
        this.body.rotateX(- Math.PI * 0.5);
        this.velocity = velocity;
    }

    move() {
        this.body.rotateY(0.2);
        this.body.position.z -= this.velocity;
    }
}



