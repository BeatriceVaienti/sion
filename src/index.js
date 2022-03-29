import { Scene, CameraHelper, Raycaster, Vector2, Object3D, WebGLRenderer, UnsignedByteType, PMREMGenerator,SphereGeometry, Mesh, MeshStandardMaterial, DirectionalLight, PCFSoftShadowMap, AmbientLight, PerspectiveCamera} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// Import our glTF model.
import gltfUrl from "../scene/sion_app.gltf";

// Create the renderer and scene
const scene = new Scene();

const canvas = document.getElementById("canvas");

const renderer = new WebGLRenderer({ canvas, antialias:true});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap; // default THREE.PCFShadowMap
renderer.setSize(canvas.clientWidth, canvas.clientHeight );

const camera = new PerspectiveCamera(
  45,
  canvas.clientWidth / canvas.clientHeight,
  3,
  10000
);
camera.position.set(800, 200, -800);

const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set(1000,20, -1000);
controls.zoomSpeed = 0.4
controls.update();

const amblight = new AmbientLight(0xffffff, 0.5);
scene.add(amblight);

//Create a DirectionalLight and turn on shadows for the light
const light = new DirectionalLight( 0xffffff, 0.7, 100 );
light.position.set( 2000, 900, -2000 ); //default; light shining from top

light.castShadow = true; // default false
scene.add( light );

//Set up shadow properties for the light
light.shadow.mapSize.width = 2048; // default
light.shadow.mapSize.height = 2048; // default
light.shadow.camera.near = 0.5; // default
light.shadow.camera.far = 4000; // default

let d = 4000; 
light.shadow.camera.left = - d; 
light.shadow.camera.right = d; 
light.shadow.camera.top = d; 
light.shadow.camera.bottom = - d; 
light.shadowCameraVisible = true;

let helper = new CameraHelper ( light.shadow.camera );
scene.add( helper );

 
// Instruct the engine to resize when the window does.
window.addEventListener('resize', () => {
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
 
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.setPixelRatio(window.devicePixelRatio);
  });
 // const composer = new EffectComposer( renderer );
 

var pmremGenerator = new PMREMGenerator( renderer );
pmremGenerator.compileEquirectangularShader();
var rgbeLoader = new RGBELoader()
        .setDataType( UnsignedByteType )
        .setPath( 'hdr/' );
var texture = new RGBELoader('hdr/venice_sunset_1k.hdr');
var envMap = pmremGenerator.fromEquirectangular
//scene.background = envMap;
scene.environment = envMap;


 // Load the glTF model and add it to the scene.
 const loader = new GLTFLoader();
 loader.load(gltfUrl, (gltf) => {
   
   scene.add(...gltf.scene.children);

 });

 scene.traverse( function( child ) { 

  if (child.isMesh) {
    child.castShadow = true;
    child.receiveShadow = true;
    child.material = MeshStandardMaterial
    
  
  }


  }

 );
scene.receiveShadow = true;
scene.castShadow = true;


//-------
document.addEventListener('mousedown', onDocumentMouseDown, false);
document.addEventListener('mousemove', onDocumentMouseMove, false); 

var raycaster = new Raycaster(); // create once
var mouse = new Vector2(); // create once
function onDocumentMouseDown(event) {

  event.preventDefault();

  mouseYOnMouseDown = event.clientY - windowHalfY;
  mouseXOnMouseDown = event.clientX - windowHalfX;

  var vector = new Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
  vector = vector.unproject(camera);
  
  raycaster.setFromCamera( mouse, camera );
  
  var intersects = raycaster.intersectObjects(circleObj, true); // Circle element which you want to identify

  if (intersects.length > 0) {
      alert("Mouse on Circle");
  }

}


mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
//-----------

  
 // Start the engine's main render loop.
 const animate = () => {
   renderer.render(scene, camera);
   requestAnimationFrame(animate);
 }

 animate();