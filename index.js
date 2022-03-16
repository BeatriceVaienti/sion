import { Scene, WebGLRenderer, AmbientLight, PerspectiveCamera } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// Import our glTF model.
import gltfUrl from "../scene/fox.gltf";

// Create the renderer and scene, which will consist of one light and the main camera.
const canvas = document.getElementById("canvas");
const renderer = new WebGLRenderer({ canvas });
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
const scene = new Scene();

const camera = new PerspectiveCamera(
  45,
  canvas.clientWidth / canvas.clientHeight,
  1,
  1000
);
camera.position.set(200, 40, 0);
camera.lookAt(0, 40, 0);
scene.add(camera);

const light = new AmbientLight();
scene.add(light);

 // Load the glTF model and add it to the scene.
 const loader = new GLTFLoader();
 loader.load(gltfUrl, (gltf) => {
   scene.add(...gltf.scene.children);
 });

 // Instruct the engine to resize when the window does.
 window.addEventListener('resize', () => {
   camera.aspect = canvas.clientWidth / canvas.clientHeight;
   camera.updateProjectionMatrix();

   renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
 });

 // Start the engine's main render loop.
 const animate = () => {
   renderer.render(scene, camera);
   requestAnimationFrame(animate);
 }

 animate();