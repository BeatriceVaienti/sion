import { Scene, ShaderLib, EdgesGeometry, LineSegments, LineBasicMaterial, RGBAFormat, Color, NoBlending, PointLightHelper, NearestFilter, WebGLRenderTarget,  CameraHelper, ShaderMaterial, Raycaster, UniformsUtils, DirectionalLightHelper, Vector2, Object3D, WebGLRenderer, UnsignedByteType, PMREMGenerator,SphereGeometry, Mesh, MeshStandardMaterial, MeshPhysicalMaterial, DirectionalLight, PCFSoftShadowMap, AmbientLight, PerspectiveCamera, Fog, Vector3, Box3, PointLight} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { SSAOShader } from 'three/examples/jsm/shaders/SSAOShader.js';
import { HDRCubeTextureLoader } from 'three/examples/jsm/loaders/HDRCubeTextureLoader';
import { SAOPass } from 'three/examples/jsm/postprocessing/SAOPass.js';
import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

// Import our glTF model.
import gltfUrl from "../scene/sion_owners_walls_hqTIN.gltf";




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
camera.position.set(950, 400, -900);

const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set(1000,0, -1200);
controls.zoomSpeed = 1
controls.update();

const amblight = new AmbientLight(0xffffff, 0.2);
scene.add(amblight);

scene.fog = new Fog(0xffffff, 0, 1500);
scene.background = 0xffffff
//Create a DirectionalLight and turn on shadows for the light
const light = new DirectionalLight( 0xffffff,  0.4);
light.position.set( 1500, 1500, -1000); //default; light shining from top
light.castShadow = true; // default false
scene.add( light );
//Set up shadow properties for the light
light.shadow.mapSize.width = 900000000; 
light.shadow.mapSize.height = 900000000; 
const shadow = new CameraHelper(light.shadow.camera)
light.shadow.camera.near = 0.5; 
light.shadow.camera.far = 10000; 
const d =1500; 
light.shadow.camera.left = - d; 
light.shadow.camera.right = d; 
light.shadow.camera.top = d; 
light.shadow.camera.bottom = - d; 
light.target.position.set(1000,0,-1200);
scene.add(light.target);


const light2 = new PointLight( 0xffffff,0.2);
light2.position.set(800, 300,-1300); //default; light shining from top
light2.castShadow = false; // default false
scene.add( light2 );
light2.decay=3;


const light3 = new PointLight(0xffffff	,0.2);
light3.position.set(900, 150,-1150); //default; light shining from top
scene.add(light3);
light3.castShadow = false;
light3.decay = 3;


//console.log("light3 target", light3)

// var helper3 = new PointLightHelper(light2);
// scene.add(helper3);


var helper = new DirectionalLightHelper(light);
scene.add(helper);

const wall = ()=>new MeshPhysicalMaterial({color: 0xdcdcdc, metalness: 0.1, roughness:0.8});
const roof = ()=>new MeshPhysicalMaterial({color: 0x808080, metalness: 0.5, roughness: 0.9});
const ground = ()=>new MeshPhysicalMaterial({color: 0x776e69, metalness: 0.3, roughness: 1});



// const loader = new OBJLoader();
// loader.load( "models/obj/ninja/ninjaHead_Low.obj", function ( group ) {
//   const geometry = group.children[ 0 ].geometry;
//   geometry.attributes.uv2 = geometry.attributes.uv;
//   geometry.center();


console.log(wall)
 // Load the glTF model and add it to the scene.
 const loader = new GLTFLoader();
 loader.load(gltfUrl, (gltf) => {   
   

   scene.add(...gltf.scene.children);
   var box = new Box3().setFromObject(gltf.scene);
   box.getCenter(gltf.scene.position);
   gltf.scene.position.multiplyScalar(-1);
   scene.traverse( function(node){
     
     if (node.isMesh){
      console.log(node.geometry);


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

      if (node.geometry != undefined){
        const geometry = node.geometry;
        geometry.attributes.uv2 = geometry.attributes.uv;
        geometry.attributes.uv2.name = "AO_mq.png"

      }

     }
     
  
  });
 });


// Load envMap
// don't know why but the locally saved file was not found, I needed to use a url
const pmremGenerator = new PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();
const rgbeLoader = new RGBELoader();

rgbeLoader.load('https://threejs.org/examples/textures/equirectangular/venice_sunset_1k.hdr', function(texture) {

  const envMap = pmremGenerator.fromEquirectangular(texture).texture;

  //scene.background = envMap;
  scene.environment = envMap;

  texture.dispose();
  pmremGenerator.dispose();

  });


// Instruct the engine to resize when the window does.
window.addEventListener('resize', onWindowResize, false);

function onWindowResize(){
  renderer.setSize( window.innerWidth, window.innerHeight );
  camera.aspect = window.innerWidth / window.innerHeight;
  // composer.setSize( window.innerWidth, window.innerHeight );
  // var pixelRatio = renderer.getPixelRatio();
  // fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( container.offsetWidth * pixelRatio );
  // fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( container.offsetHeight * pixelRatio );

  camera.updateProjectionMatrix();
}

function from_userData_to_owner_info_list(userData){

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
  //console.log("owners", owners)
  //<tr> <td>1648 - 1656</td><td>prob. Carloz, Carlo (y c. G 51)</td></tr>
  console.log(owners.length)
  if(owners.length===0){
    document.getElementById("owner-table").innerHTML=  ("<tr> <td>"+"-"+"</td><td>"+"-"+"</td></tr>")
  } else {
    document.getElementById("owner-table").innerHTML=  owners.map(o=> "<tr> <td>"+o.start_year+" - "+o.end_year+"</td><td>"+o.name+"</td></tr>").join("\n");
  }
}



function onPointerMove( event ) {

  // calculate pointer position in normalized device coordinates
  // (-1 to +1) for both components

  const elem = renderer.domElement
  const boundingRect = elem.getBoundingClientRect()
  pointer.x = (event.clientX - boundingRect.left)  / boundingRect.width * 2 - 1
  pointer.y = - (event.clientY - boundingRect.top)  / boundingRect.height * 2 + 1
}



var old_selected_building = null
function onClick(){
  document.getElementById("owner-info").style.visibility = "hidden";
  const selected_building = get_closest_intersected_building()

  if(selected_building!==null){
    document.getElementById("owner-info").style.visibility = "visible";
    selected_building.object.parent.children.forEach(c=>c.material.emissive.set( "blue" ))
    //console.log(selected_building.object.parent.parent.userData)
    //console.log(selected_building.object.material.emissive)
    fill_selected_object_owner_info(selected_building.object.parent.parent.userData)
    
    if(old_selected_building!==null &&  old_selected_building.object.id!=selected_building.object.id){
      old_selected_building.object.parent.children.forEach(c=>c.material.emissive.set( "black" ))
    }
    old_selected_building = selected_building
  }
}

function get_closest_intersected_building(){
  // update the picking ray with the camera and pointer position
  raycaster.setFromCamera( pointer, camera );

  // calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects( scene.children );
  
  if(intersects.length>0 && intersects[0].object.parent.parent.userData.type  === "Building"){
    return intersects[0];
  }
  return null;
}

var old_intersected_building = null
function render() {
  
  const intersected_building = get_closest_intersected_building()

  if(intersected_building!==null && intersected_building.object.material.emissive.b !=1){
    //console.log(intersected_building.object.material.emissive.b)
    intersected_building.object.parent.children.forEach(c=>c.material.emissive.set( "red" ))
    // intersected_building.object.parent.children.forEach(c=>outlinePass.c = c)

    //console.log(intersected_building.object.parent.parent.userData)
    //fill_selected_object_owner_info(intersected_building.object.parent.parent.userData)

    if(old_intersected_building!==null && 
      old_intersected_building.object.id!=intersected_building.object.id && old_intersected_building.object.material.emissive.b != 1 //&&old_intersected_building.object.id!=old_selected_building.object.id
    ){
      old_intersected_building.object.parent.children.forEach(c=>c.material.emissive.set( "black" ))
    }
    old_intersected_building = intersected_building
  }
}
canvas.addEventListener( 'pointermove', onPointerMove );
canvas.addEventListener( 'click', onClick );


// Start the engine's main render loop.
const animate = () => {
  renderer.render(scene, camera);
  // Animate
  // composer.render();
  render();
  requestAnimationFrame(animate);
}
animate();