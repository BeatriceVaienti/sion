import { Scene, CameraHelper, Raycaster, Vector2, Object3D, WebGLRenderer, UnsignedByteType, PMREMGenerator,SphereGeometry, Mesh, MeshStandardMaterial, DirectionalLight, PCFSoftShadowMap, AmbientLight, PerspectiveCamera} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// Import our glTF model.
import gltfUrl from "../scene/sion_deployment.gltf";

// Create the renderer and scene
const scene = new Scene();
const canvas = document.getElementById("canvas");
const renderer = new WebGLRenderer({ canvas, antialias:true});
const raycaster = new Raycaster();
const pointer = new Vector2();

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

const amblight = new AmbientLight(0xffffff, 1);
scene.add(amblight);

//Create a DirectionalLight and turn on shadows for the light
const light = new DirectionalLight( 0xffffff, 0.7, 100 );
light.position.set( 2000, 900, -2000 ); //default; light shining from top

light.castShadow = true; // default false
scene.add( light );

//Set up shadow properties for the light
light.shadow.mapSize.width = 2048; 
light.shadow.mapSize.height = 2048; 
light.shadow.camera.near = 0.5; 
light.shadow.camera.far = 4000; 

let d = 4000; 
light.shadow.camera.left = - d; 
light.shadow.camera.right = d; 
light.shadow.camera.top = d; 
light.shadow.camera.bottom = - d; 

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

window.addEventListener( 'pointermove', onPointerMove );
window.requestAnimationFrame(render);
 

var pmremGenerator = new PMREMGenerator( renderer );
pmremGenerator.compileEquirectangularShader();
var rgbeLoader = new RGBELoader()
        .setDataType( UnsignedByteType )
        .setPath( 'hdr/' );
var texture = new RGBELoader('hdr/venice_sunset_1k.hdr');
var envMap = pmremGenerator.fromEquirectangular

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
    child.material = MeshStandardMaterial;
    
  
    }
  }

 );
  


function onPointerMove( event ) {

  // calculate pointer position in normalized device coordinates
  // (-1 to +1) for both components

  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function render() {

  // update the picking ray with the camera and pointer position
  raycaster.setFromCamera( pointer, camera );

  // calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects( scene.children );

  for ( let i = 0; i < intersects.length; i ++ ) {

    intersects[ i ].object.material.color.set( 0xff0000 );

  }

  renderer.render( scene, camera );

}



// Start the engine's main render loop.
const animate = () => {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}


animate();