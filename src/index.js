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
const light = new DirectionalLight( 0xffffff, 2, 100 );
light.position.set( 2000, 3000, -2000 ); //default; light shining from top

light.castShadow = true; // default false
scene.add( light );

//Set up shadow properties for the light
light.shadow.mapSize.width = 2048; 
light.shadow.mapSize.height = 2048; 
light.shadow.camera.near = 0.5; 
light.shadow.camera.far = 4000; 

const d = 8000; 
light.shadow.camera.left = - d; 
light.shadow.camera.right = d; 
light.shadow.camera.top = d; 
light.shadow.camera.bottom = - d; 

let helper = new CameraHelper ( light.shadow.camera );
scene.add( helper );


var pmremGenerator = new PMREMGenerator( renderer );
pmremGenerator.compileEquirectangularShader();
var rgbeLoader = new RGBELoader()
        .setDataType( UnsignedByteType )
        .setPath( 'hdr/' );
var texture = new RGBELoader('hdr/venice_sunset_1k.hdr');
var envMap = pmremGenerator.fromEquirectangular
const wall = ()=>new MeshStandardMaterial({color: 0x808080, metalness: 0, roughness:1});
const roof = ()=>new MeshStandardMaterial({color: 0x212121, metalness: 0, roughness: 1});
const ground = ()=>new MeshStandardMaterial({color: 0x776e69, metalness: 0, roughness: 1});
scene.environment = envMap;


 // Load the glTF model and add it to the scene.
 const loader = new GLTFLoader();
 loader.load(gltfUrl, (gltf) => {   
   scene.add(...gltf.scene.children);
   scene.traverse( function(node){
     if (node.isMesh){
      console.log(node)
      if (node.material.name === "WallSurface"){
        node.material = wall();        
      }

      if (node.material.name == "RoofSurface"){
        node.material= roof();
      }

      if (node.material.name === "GroundSurface"){
        node.material = ground();

      }


      node.castShadow = true;
      node.receiveShadow = true;
     }
    
  });
 });


// Instruct the engine to resize when the window does.
window.addEventListener('resize', onWindowResize, false);

function onWindowResize(){
  renderer.setSize( window.innerWidth, window.innerHeight );
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function from_userData_to_owner_info_list(userData){
  /*attributes.height: "13.693991310120335"
  attributes.owners.0.end_year: 1627
  attributes.owners.0.name: "Waldin"
  attributes.owners.0.start_year: 16103*/
  const owners = []
  for(var i=0; i<20;i++){
    const start_year = userData["attributes.owners."+i+".start_year"]
    const end_year = userData["attributes.owners."+i+".end_year"]
    const name = userData["attributes.owners."+i+".name"]
    if(name === undefined){
      break
    } else{
      owners.push({start_year, end_year, name})
    }
  }
  return owners
}

function fill_selected_object_owner_info(userData){
  const owners= from_userData_to_owner_info_list(userData)
  console.log("owners", owners)
  //<tr> <td>1648 - 1656</td><td>prob. Carloz, Carlo (y c. G 51)</td></tr>
  document.getElementById("owner-table").innerHTML=  owners.map(o=> "<tr> <td>"+o.start_year+" - "+o.end_year+"</td><td>"+o.name+"</td></tr>").join("\n")
}

function onPointerMove( event ) {

  // calculate pointer position in normalized device coordinates
  // (-1 to +1) for both components

  const elem = renderer.domElement
  const boundingRect = elem.getBoundingClientRect()
  pointer.x = (event.clientX - boundingRect.left)  / boundingRect.width * 2 - 1
  pointer.y = - (event.clientY - boundingRect.top)  / boundingRect.height * 2 + 1
}

var oldintersects = []
function render() {
  // update the picking ray with the camera and pointer position
  raycaster.setFromCamera( pointer, camera );

  // calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects( scene.children );
  
  //console.log("intersects:", intersects)

  //for ( let i = 0; i < intersects.length; i ++ ) {
  //  intersects[ i ].object.material.color.set( "red" );
  //}
  intersects.forEach((isect,i) => {
    if(i==0 && isect.object.name != "0_LoD1_tin"){
      isect.object.parent.children.forEach(c=>c.material.emissive.set( "red" ))
      console.log(isect.object.parent.parent.userData)
      fill_selected_object_owner_info(isect.object.parent.parent.userData)
    }
  })
  const intersectsIds = intersects.map(isect=> isect.object.id)
  oldintersects.forEach(isect => {
    //if(!intersectsIds.includes(isect.object.id)){
    if(intersects.length==0 || isect.object.id!=intersects[0].object.id){
      //isect.object.material.emissive.set( "black" )
      isect.object.parent.children.forEach(c=>c.material.emissive.set( "black" ))
    }
  })
  oldintersects=intersects
  //console.log(intersects)
}
window.addEventListener( 'pointermove', onPointerMove );

// Start the engine's main render loop.
const animate = () => {
  renderer.render(scene, camera);
  render()
  requestAnimationFrame(animate);
}



animate();

