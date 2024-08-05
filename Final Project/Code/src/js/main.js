import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { BoxObstacle } from "./Obstacles.js";
import { Ring, Teapot, SuperPowerUnit } from "./Items.js";
import { Ground } from "./Ground.js";
import { CharacterController } from "./CharacterController.js";
import { WallManager } from "./WallManager.js";

import starsTexture from "../imgs/stars.jpg";


// ========================= Global Variables ============================
var modal = document.querySelector(".modal-box");
var score = 0;
var scoreFactor = 1;
var gamestart = false;
var gameOver = 0;
var finish = 0;
var isFirstPerson;

const scoreSpan =  document.querySelector(".score-content")
scoreSpan.innerHTML = score;
let keyboard = {};



// ============================ ModalBox ========================================
function startGame() {
	gamestart = true;
	modal.style.display = "none";
    document.querySelector(".score-box").style.display = "flex";

    const povTag = document.querySelector(".point-of-view");
    povTag.style.display = "flex";
    isFirstPerson = povTag.value === "1" ? true : false;
}

function restartGame() {
    document.location.reload();
}

document.querySelector(".start-button").addEventListener("click", startGame);

document.querySelector(".restart-button").addEventListener("click", restartGame);

function finishGame() {
	modal.style.display = "flex";

	x = document.querySelector(".game_title");
	if (gameOver) x.innerHTML = "Game Over";
	else if (finish) x.innerHTML = "You Won!";

	y = document.querySelector(".game_score");
	y.textContent = "Your score: " + score;
	y.style.display = "flex";

	z = document.querySelector(".start-button");
	z.style.display = "none";

	w = document.querySelector(".restart-button");
	w.style.display = "flex";

    document.querySelector(".point-of-view").style.display = "none";

    document.querySelector(".score-box").style.display = "none";
}



// =============================== Camera, scene, helper ===================================
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	40
);
camera.position.set(0, 10, 10);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = false;

const light = new THREE.DirectionalLight(0xffffff, 3);
light.castShadow = true;
light.position.set(8, 15, -20);
light.shadow.camera.left = -35;
light.shadow.camera.right = 6;
light.shadow.camera.top = 40;
light.shadow.camera.bottom = -6;
scene.add(light);

const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
	starsTexture,
	starsTexture,
	starsTexture,
	starsTexture,
	starsTexture,
	starsTexture,
]);



// ========================================= Helper ==================================
// const axesHelper = new THREE.AxesHelper(10);
// scene.add(axesHelper);

// const gridHelper = new THREE.GridHelper(100, 100);
// scene.add(gridHelper);

// const helper = new THREE.CameraHelper(light.shadow.camera);
// scene.add(helper);




// ======================================== GROUND =======================================
const ground = new Ground(12, 6, 100, 0, -3, 30);
ground.receiveShadow = true;
scene.add(ground);

const dragon = {} // This is used for decorated

new GLTFLoader().load((new URL("../assets/skeleton_dragon.glb", import.meta.url)).href, function (gltf) {
    // Model
    const model = gltf.scene;
    model.traverse(function (object) {
        if (object.isMesh) object.castShadow = true;
    });
    model.scale.set(80, 80, 80);

    // Add model to bbox
    model.position.y = -7;
    model.position.z = 60;
    model.rotateY(Math.PI);
    scene.add(model);

    // Animation controller
    const gltfAnimation = gltf.animations;
    const mixer = new THREE.AnimationMixer(model);

    gltfAnimation.forEach((a) => {
            if (a.name === "attack_5") {
                mixer.clipAction(a).play();
                console.log('update')
            }
    });

    dragon.model = model;
    dragon.mixer = mixer;
});



// ====================================== OBSTACLES =====================================
const wallManager = new WallManager();



// ======================================== CHARACTER ===================================
let characterController;
const modelUrl = new URL("../assets/robot.glb", import.meta.url);

new GLTFLoader().load(modelUrl.href, function (gltf) {
    // Model
    const model = gltf.scene;
    model.traverse(function (object) {
        if (object.isMesh) object.castShadow = true;
    });
    model.scale.set(1.7, 1.7, 1.7);

    // Bounding Box of Model
    const bbox = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 5.5, 2.25),
        new THREE.MeshBasicMaterial({
        color: "green",
        transparent: true,
        opacity: 0,
        })
    );

    // Add model to bbox
    bbox.position.y = 2.75;
    model.position.y = -2.75;
    model.position.z = 0;
    bbox.add(model);
    scene.add(bbox);

    // Animation controller
    const gltfAnimation = gltf.animations;
    const mixer = new THREE.AnimationMixer(model);
    const animationsMap = new Map();
    gltfAnimation
        .filter((a) => a.name != "TPose")
        .forEach((a) => {
        const clipAction = mixer.clipAction(a);
        // if (a.name == "Armature.001|JumpAnimation")
        //     clipAction.timeScale = 0.5;
        animationsMap.set(a.name, clipAction);
        });

    characterController = new CharacterController(
        model,
        bbox,
        mixer,
        animationsMap,
        camera,
    );
});

addKeysListener();

function addKeysListener() {
	window.addEventListener(
		"keydown",
		function (event) {
		keyboard[event.keyCode] = true;
		},
		false
	);
	window.addEventListener(
		"keyup",
		function (event) {
		keyboard[event.keyCode] = false;
		},
		false
	);
}



// ================== ANIMATION ===========================
frame_cnt = 0;
let timer = -1; // Wall cycle
const clock = new THREE.Clock();

function animate() {
	const id = requestAnimationFrame(animate);
	const mixerUpdateDelta = clock.getDelta();
	renderer.render(scene, camera);

	scoreSpan.innerHTML = score;

	if (!gameOver && !finish && gamestart) {
		// Character
		if (characterController) {
			// Update movement and animation of character
			characterController.update(mixerUpdateDelta, keyboard, ground, isFirstPerson);

			// Update movement of items and obstacles
			wallManager.update();

			// Check collision with obstacles
			if (characterController.isStoppable && characterController.checkObstaclesHit(wallManager.obstacles)) {
                gameOver = 1;
            }

			// Check collision with items
			wallManager.items.forEach((item) => {
				if (characterController.checkItemPickup(item)) {
					// Player earn gold
					if (item instanceof Ring) {
						score += 10 * scoreFactor;
						console.log("Get Ring");

					} else if (item instanceof Teapot) {
                        // 2 x rings; line obstacles; increase far of camera; 
                        // see the real enemy (dragon); time: 3 walls
                        // Set mode
                        wallManager.setMode('teapot');
                        characterController.changeVision(1);
                        scoreFactor = 2;
                        timer = 3;
                    }
                    else if (item instanceof SuperPowerUnit) {
                        // 3 x rings; point obstacles; increase far of camera;
                        // see the real enemy; unstoppable; time: 5 walls
                        // Set mode
                        wallManager.setMode('superpower');
                        characterController.changeVision(1);
                        characterController.isStoppable = false;
                        scoreFactor = 3;
                        timer = 5;
                    }
                }
            });

			// Remove invalids
			wallManager.removeInvalObjs(scene, characterController);

			frame_cnt++;

			if (frame_cnt == 150) {
                if (timer > -1) {
                    if (timer == 0) {
                        wallManager.setMode(null);
                        characterController.changeVision(0);
                        characterController.isStoppable = true;
                        scoreFactor = 1;
                        timer == -1;
                    }
                    else {
                        timer--;
                    }
                }

				wallManager.generateWall(scene);
				frame_cnt = 0;
			}
		}

        if (dragon.model) {
            dragon.mixer.update(mixerUpdateDelta);
        } 
	} 
    else {
		if (gameOver || finish) {
			finishGame();
		}
	}
}

animate();

// ========= Make canvas responsive
window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});
