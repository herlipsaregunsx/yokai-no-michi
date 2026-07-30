import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import './style.css';

// === Scene ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070a);
scene.fog = new THREE.FogExp2(0x0a1218, 0.35);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 120);
camera.position.set(0, 1.7, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// === Lights ===
scene.add(new THREE.AmbientLight(0x1a2430, 0.2));
const moonLight = new THREE.DirectionalLight(0x3a4a5a, 0.2);
moonLight.position.set(10, 25, 5);
scene.add(moonLight);

// === Flashlight ===
const flashlight = new THREE.SpotLight(0xffeecc, 20, 18, Math.PI / 6.5, 0.4, 1);
flashlight.position.set(0, 0, 0);
flashlight.target.position.set(0, 0, -1);
camera.add(flashlight);
camera.add(flashlight.target);
scene.add(camera);

let flashlightOn = true;

// === Objective ===
const objectiveUI = document.createElement('div');
objectiveUI.style.cssText = `
  position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
  color: #c9b8a0; font-family: Georgia, serif; font-size: 1.15rem;
  letter-spacing: 2px; opacity: 0.85; z-index: 100;
  text-shadow: 0 0 12px rgba(0,0,0,0.9); pointer-events: none;
`;
objectiveUI.innerHTML = `Find the temple`;
document.body.appendChild(objectiveUI);

// === Fade Overlay ===
const fadeOverlay = document.createElement('div');
fadeOverlay.style.cssText = `
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: black; opacity: 0; z-index: 200; pointer-events: none;
  transition: opacity 1.8s ease;
`;
document.body.appendChild(fadeOverlay);

// === Ground ===
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(150, 150),
  new THREE.MeshStandardMaterial({ color: 0x1a2a1a, roughness: 0.95 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// === Path (Area 1) ===
const path = new THREE.Mesh(
  new THREE.BoxGeometry(3.5, 0.08, 50),
  new THREE.MeshStandardMaterial({ color: 0x2e3238, roughness: 0.9 })
);
path.position.set(0, 0.04, -20);
scene.add(path);

// === Loader ===
const loader = new GLTFLoader();
const area1Objects = [];

// === Area 1 models ===
loader.load('/wall/damaged_concrete_wall_element.glb', (gltf) => {
  const wall = gltf.scene;
  const box = new THREE.Box3().setFromObject(wall);
  wall.position.sub(box.getCenter(new THREE.Vector3()));
  wall.scale.set(1.45, 1.45, 1.45);
  const groundBox = new THREE.Box3().setFromObject(wall);
  wall.position.y -= groundBox.min.y;
  wall.position.set(-2.4, wall.position.y, 1.7);
  wall.rotation.y = -1.52;
  scene.add(wall);
  area1Objects.push(wall);
});

loader.load('/barrier/free_road_barrier_low-poly_pbr.glb', (gltf) => {
  const barrier = gltf.scene;
  const box = new THREE.Box3().setFromObject(barrier);
  barrier.position.sub(box.getCenter(new THREE.Vector3()));
  barrier.scale.set(1.0, 1.0, 1.0);
  const groundBox = new THREE.Box3().setFromObject(barrier);
  barrier.position.y -= groundBox.min.y;
  barrier.position.set(3.3, barrier.position.y, 1.0);
  barrier.rotation.y = -1.68;
  scene.add(barrier);
  area1Objects.push(barrier);
});

const lampPos = new THREE.Vector3(-2.2, 0, -5.4);

loader.load('/lamp/low_polyps1_style_street_lamp.glb', (gltf) => {
  const lamp = gltf.scene;
  const box = new THREE.Box3().setFromObject(lamp);
  lamp.position.sub(box.getCenter(new THREE.Vector3()));
  lamp.scale.set(1.0, 1.0, 1.0);
  const groundBox = new THREE.Box3().setFromObject(lamp);
  lamp.position.y -= groundBox.min.y;
  lamp.position.set(-2.2, lamp.position.y, -5.4);
  lamp.rotation.y = 1.44;
  scene.add(lamp);
  area1Objects.push(lamp);

  const lampLight = new THREE.PointLight(0xffcc88, 8, 25, 1.2);
  lampLight.position.set(-2.2, 5.5, -5.4);
  scene.add(lampLight);
  area1Objects.push(lampLight);

  setInterval(() => {
    if (!hasTransitioned) lampLight.intensity = 6 + Math.random() * 4;
  }, 100);
});

loader.load('/bike/bicycle_low-poly_minimalistic.glb', (gltf) => {
  const bike = gltf.scene;
  const box = new THREE.Box3().setFromObject(bike);
  bike.position.sub(box.getCenter(new THREE.Vector3()));
  bike.scale.set(1.7, 1.7, 1.7);
  const groundBox = new THREE.Box3().setFromObject(bike);
  bike.position.y -= groundBox.min.y;
  bike.position.set(2.5, bike.position.y, 0.0);
  bike.rotation.y = 0.0;
  scene.add(bike);
  area1Objects.push(bike);
});

loader.load('/garbage/garbage_bags.glb', (gltf) => {
  const garbage = gltf.scene;
  const box = new THREE.Box3().setFromObject(garbage);
  garbage.position.sub(box.getCenter(new THREE.Vector3()));
  garbage.scale.set(1.5, 1.5, 1.5);
  const groundBox = new THREE.Box3().setFromObject(garbage);
  garbage.position.y -= groundBox.min.y;
  garbage.position.set(1.3, garbage.position.y, -2.0);
  garbage.rotation.y = 1.12;
  scene.add(garbage);
  area1Objects.push(garbage);
});

// === Area 2 ===
let hasTransitioned = false;

function goToArea2() {
  hasTransitioned = true;
  fadeOverlay.style.opacity = '1';

  setTimeout(() => {
    area1Objects.forEach(obj => scene.remove(obj));
    area1Objects.length = 0;
    scene.remove(path);
    scene.remove(ground);

    const newGround = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120),
      new THREE.MeshStandardMaterial({ color: 0x1a1f1a, roughness: 0.95 })
    );
    newGround.rotation.x = -Math.PI / 2;
    scene.add(newGround);

    // Japanese street LOCKED
    loader.load('/city/japanese_street_at_night.glb', (gltf) => {
      const cityStreet = gltf.scene;
      const box = new THREE.Box3().setFromObject(cityStreet);
      cityStreet.position.sub(box.getCenter(new THREE.Vector3()));
      cityStreet.scale.set(2.3, 2.3, 2.3);

      const groundBox = new THREE.Box3().setFromObject(cityStreet);
      cityStreet.position.y -= groundBox.min.y;

      cityStreet.position.set(0, cityStreet.position.y, -1.0);
      cityStreet.rotation.y = 0;
      scene.add(cityStreet);
    });

    // Player starts at the view you showed
    camera.position.set(0, 1.7, 6);

    scene.fog = new THREE.FogExp2(0x0a1218, 0.04);
    objectiveUI.innerHTML = `Main Street`;

    setTimeout(() => {
      fadeOverlay.style.opacity = '0';
    }, 700);
  }, 2000);
}

// === Controls ===
const controls = new PointerLockControls(camera, document.body);

const blocker = document.createElement('div');
blocker.id = 'blocker';
blocker.innerHTML = `
  <div style="text-align:center;color:#c9b8a0;font-family:Georgia,serif">
    <h1 style="font-size:2.8rem;margin-bottom:0.5rem;letter-spacing:3px">Yōkai no Michi</h1>
    <p style="font-size:1.1rem;opacity:0.7;margin-bottom:2rem">Path of the Yōkai</p>
    <p style="font-size:1rem;opacity:0.5">Click to enter</p>
  </div>
`;
blocker.style.cssText = `
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center;
  z-index: 10; cursor: pointer;
`;
document.body.appendChild(blocker);

blocker.addEventListener('click', () => controls.lock());
controls.addEventListener('lock', () => blocker.style.display = 'none');
controls.addEventListener('unlock', () => blocker.style.display = 'flex');

const move = { forward: false, backward: false, left: false, right: false };

document.addEventListener('keydown', (e) => {
  if (e.code === 'KeyW') move.forward = true;
  if (e.code === 'KeyS') move.backward = true;
  if (e.code === 'KeyA') move.left = true;
  if (e.code === 'KeyD') move.right = true;
  if (e.code === 'KeyF') {
    flashlightOn = !flashlightOn;
    flashlight.visible = flashlightOn;
  }
});

document.addEventListener('keyup', (e) => {
  if (e.code === 'KeyW') move.forward = false;
  if (e.code === 'KeyS') move.backward = false;
  if (e.code === 'KeyA') move.left = false;
  if (e.code === 'KeyD') move.right = false;
});

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let prevTime = performance.now();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  const time = performance.now();
  const delta = (time - prevTime) / 1000;
  prevTime = time;

  if (!hasTransitioned) {
    const dist = camera.position.distanceTo(lampPos);
    if (dist < 5) goToArea2();
  }

  if (controls.isLocked) {
    velocity.x -= velocity.x * 8 * delta;
    velocity.z -= velocity.z * 8 * delta;
    direction.z = Number(move.forward) - Number(move.backward);
    direction.x = Number(move.right) - Number(move.left);
    direction.normalize();
    if (move.forward || move.backward) velocity.z -= direction.z * 14 * delta;
    if (move.left || move.right) velocity.x -= direction.x * 14 * delta;
    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    if (hasTransitioned) camera.position.y = 1.7;
  }

  renderer.render(scene, camera);
}
animate();