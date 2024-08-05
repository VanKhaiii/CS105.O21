import * as THREE from 'three';
import {BoxObstacle, SphereObstacle, ConeObstacle, CylinderObstacle } from './Obstacles.js'
import {CharacterController} from './CharacterController.js'
import {OrbitControls, OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import moonTexture from '../imgs/moon.webp'
import starsTexture from '../imgs/stars.jpg'
import sandTexture from '../imgs/sand.jpg'

// ================ Global variable
let keyboard = {};

// =================== Camera, scene, helper =====================
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    50,
)
camera.position.set(0, 5, -10);
const OrbitControls = new OrbitControls(camera, renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 3);
light.castShadow = true;
light.position.set(8, 20, -10);
light.target.position.set(-4, 0, 15);
const lightHelper = new THREE.DirectionalLightHelper(light, 5);

light.shadowCameraLeft = -3000;
light.shadowCameraRight = 3000;
light.shadowCameraTop = 3500;
light.shadowCameraBottom = -3000;
scene.add(lightHelper);
scene.add(light)

const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture,
]);

// Helper
const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);

// const gridHelper = new THREE.GridHelper(100, 100);
// scene.add(gridHelper);

// ================== Objects ===========
const textureLoader = new THREE.TextureLoader()

// ----- Ground ------
const groundGeo = new THREE.BoxGeometry(12, 6, 75);
const groundMaterial = new THREE.MeshStandardMaterial({
    map: textureLoader.load(sandTexture),
    side: THREE.DoubleSide,
});
const ground = new THREE.Mesh(groundGeo, groundMaterial);
ground.receiveShadow = true;
ground.position.set(0, -3, 25);
scene.add(ground);

// ------ Obstacles ------
let obstacles = [
    new BoxObstacle(3, 3, 3, 2, 20, 0.15, 'red'),
    new CylinderObstacle(4, 4, -2, 14, 0.2, 'blue'),
    new SphereObstacle(3, -2, 20, 0.2, 'green'),
    new ConeObstacle(2, 5, 4, 25, 0.3, 'green')
];

obstacles.forEach((obs) => {
    scene.add(obs);
    obs.castShadow = true;
})

// character
let characterController;
const modelUrl = new URL('../assets/robot.glb', import.meta.url);

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
      new THREE.MeshBasicMaterial({color: 'green', transparent: true, opacity: 0.5 })
    )

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
    gltfAnimation.filter(a => a.name != 'TPose').forEach((a) => {
      const clipAction = mixer.clipAction(a);
      // if (a.name == "Armature.001|JumpAnimation")
      //     clipAction.timeScale = 0.5;
      animationsMap.set(a.name, clipAction);
    })

    characterController = new CharacterController(model, bbox, mixer, animationsMap, camera);
})


addKeysListener();

function addKeysListener(){
    window.addEventListener('keydown', function(event){
        keyboard[event.keyCode] = true;
    } , false);
    window.addEventListener('keyup', function(event){
        keyboard[event.keyCode] = false;
    } , false);
}

//================== Animation =======================
// Animation loop
obs_cycle = 150; // frames
level_cycle = 5; // obs_cycle
max_level = 7;
obs_cycle_cnt = 0;
level_cycle_cnt = 0;
level_cnt = 0;

const clock = new THREE.Clock();
function animate() {
    const id = requestAnimationFrame( animate );
    const mixerUpdateDelta = clock.getDelta();
    renderer.render(scene, camera);

    // Remove invalid obstacles
    obstacles = obstacles.filter((obs) => {
      if (obs.position.z >= -10)
          return true;
      else {
          const removedObs = scene.getObjectById(obs.id);
          scene.remove(removedObs);
          return false;
      }
    });

    // Movemenet of obstacles
    obstacles.forEach((obs) => {
      obs.move();
    })

    // Character
    if (characterController) {
        // Update movement and animation
        characterController.update(mixerUpdateDelta, keyboard);

        // Check collision
        for (var vertexIndex = 0; vertexIndex < characterController.bbox.geometry.attributes.position.array.length; vertexIndex++)
        {
            var localVertex = new THREE.Vector3().fromBufferAttribute(characterController.bbox.geometry.attributes.position, vertexIndex).clone();
            var globalVertex = localVertex.applyMatrix4(characterController.bbox.matrix);
            var directionVector = globalVertex.sub(characterController.bbox.position);

            var ray = new THREE.Raycaster(characterController.bbox.position, directionVector.clone().normalize() );
            var collisionResults = ray.intersectObjects( obstacles );
            if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() )
            {
                console.log('Hit');
                cancelAnimationFrame(id);
            }
        }
    }

    // Generate new obstacle after cycle frames
    if ((level_cnt < max_level) && (level_cycle_cnt == level_cycle)) {
        obs_cycle -= 10;
        level_cycle_cnt = 0;
        level_cnt += 1;
        console.log(`level up ${level_cnt}`)
    }

    if (obs_cycle_cnt == obs_cycle) {
        const obs = new CylinderObstacle(1.5, 20, 0, 50, 0.2, 'red');
        obs.castShadow = true;
        scene.add(obs);
        obstacles.push(obs);

        level_cycle_cnt++;
        obs_cycle_cnt = 0;
    }
    obs_cycle_cnt++;
}

animate();

