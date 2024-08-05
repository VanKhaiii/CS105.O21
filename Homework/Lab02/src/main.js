import * as THREE from 'three';
import {OrbitControls, OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

function init() {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById('webgl').appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    
    var box = getBox(1, 1, 1);
    scene.add(box);
    
    var plane = getPlane(8);
    box.position.y = box.geometry.parameters.height / 2;
    plane.rotation.x = Math.PI / 2;
    scene.add(plane);
    
    var cylinder = getCylinder(0.5, 1);
    cylinder.position.y = box.geometry.parameters.height / 2;
    cylinder.position.x = -3;
    cylinder.position.z = -2.5;
    scene.add(cylinder);
    
    var coin = getCoin();
    coin.position.y = box.geometry.parameters.height / 2 ;
    coin.position.x = 3;
    coin.position.z = -2;
    coin.rotation.x = Math.PI / 2;
    scene.add(coin);
    
    var ico = getIcosahedron(0.5, 0);
    ico.position.y = box.geometry.parameters.height / 2 ;
    ico.position.x = 2.5;
    ico.position.z = 1.5;
    scene.add(ico);
    
    var ring = getRing(0.1, 0.4, 3);
    ring.position.y = box.geometry.parameters.height / 2 + 0.5;
    ring.position.x = -3;
    ring.position.z = 1.5;
    scene.add(ring);

    var camera = new THREE.PerspectiveCamera(
        45, 
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    camera.position.set(3, 4, 8);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    
    const controls = new OrbitControls(camera, renderer.domElement);
    
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.castShadow = true;
    light.position.set(8, 20, -10);
    light.target.position.set(-4, 0, 15);
    const lightHelper = new THREE.DirectionalLightHelper(light, 5);
    
    light.shadow.camera.left = -3000;
    light.shadow.camera.right = 3000;
    light.shadow.camera.top = 3500;
    light.shadow.camera.bottom = -3000;
    scene.add(lightHelper);
    scene.add(light);

    // Sự kiện lắng nghe chuột cho OrbitControls
    window.addEventListener('resize', onWindowResize);
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        requestAnimationFrame(animate);
        coin.rotation.z += 0.01;
        cylinder.rotation.z += 0.01;
        ico.rotation.x += 0.01;
        
        ring.rotation.z += 0.01;
        ring.rotation.x += 0.01;
        ring.rotation.y += 0.01;
        
        controls.update();
        renderer.render(scene, camera);
    }

    animate();
}


function getBox(w, h, d){
    var geometry = new THREE.BoxGeometry(w, h, d);
    var material = new THREE.MeshBasicMaterial({
        color : 0x00ff00
    })
    var mesh = new THREE.Mesh(geometry, material);

    return mesh;
}

function getCylinder(radius, height){
    var geometry = new THREE.CylinderGeometry(radius, radius, height, 20);
    var material = new THREE.MeshStandardMaterial({
        color: 0x00008a,
    })
    var mesh = new THREE.Mesh(geometry, material);

    return mesh;
}

function getCoin(){
    var geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 30, true);
    var material = new THREE.MeshPhongMaterial({ color: 0xffff00 })
    var mesh = new THREE.Mesh(geometry, material);

    return mesh;
}

function getIcosahedron(r, d){
    var geometry = new THREE.IcosahedronGeometry(r, d);
    var material = new THREE.MeshBasicMaterial({
        color : 0x391311
    })
    var mesh = new THREE.Mesh(geometry, material);

    return mesh;
}

function getRing(ir, or, ts){
    const geometry = new THREE.RingGeometry( ir, or, ts ); 
    const material = new THREE.MeshBasicMaterial({ color: 0xc3b111, side: THREE.DoubleSide});
    const mesh = new THREE.Mesh( geometry, material ); 

    return mesh;
}

function getPlane(size){
    var geometry = new THREE.PlaneGeometry(size, size);
    var material = new THREE.MeshBasicMaterial({
        color : 0xff0000,
        side: THREE.DoubleSide
    })
    var mesh = new THREE.Mesh(geometry, material);

    return mesh;
}

init();