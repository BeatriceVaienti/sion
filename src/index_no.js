import { Scene, CameraHelper, WebGLRenderer, UnsignedByteType, PMREMGenerator,SphereGeometry, Mesh, MeshStandardMaterial, DirectionalLight, PCFSoftShadowMap, AmbientLight, PerspectiveCamera} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// Import our glTF model.
import gltfUrl from "../scene/sion_app.gltf";


var container, stats, controls;
var camera, scene, renderer;

init();
animate();

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 20 );
    camera.position.set( - 1.8, 0.9, 2.7 );

    controls = new THREE.OrbitControls( camera );

    var ambientLight = new THREE.AmbientLight( 0xffffff, 0.4 );
    scene.add( ambientLight );

    var spotLight = new THREE.SpotLight( 0xffffff, 1 );
    spotLight.position.set( 500, 400, 200 );
    spotLight.angle = 0.4;
    spotLight.penumbra = 0.05;
    spotLight.decay = 1;
    spotLight.distance = 2000;

    spotLight.castShadow = true;
    scene.add( spotLight );

    spotLight.target.position.set( 3, 0, - 3 );
    scene.add( spotLight.target );

    var lightHelper = new THREE.SpotLightHelper( spotLight );
    // scene.add( lightHelper );

    // model
    var loader = new THREE.GLTFLoader().setPath( 'models/gltf/test/' );
    loader.load( 'scene.gltf', function ( gltf ) {

        gltf.scene.traverse( function ( child ) {

            if ( child.isMesh ) {

                child.castShadow = true;
                child.receiveShadow = true;

            }

        } );

        // automatically center model and adjust camera

        const box = new THREE.Box3().setFromObject( gltf.scene );
        const size = box.getSize( new THREE.Vector3() ).length();
        const center = box.getCenter( new THREE.Vector3() );

        gltf.scene.position.x += ( gltf.scene.position.x - center.x );
        gltf.scene.position.y += ( gltf.scene.position.y - center.y );
        gltf.scene.position.z += ( gltf.scene.position.z - center.z );

        camera.near = size / 100;
        camera.far = size * 100;

        camera.updateProjectionMatrix();

        camera.position.copy( center );
        camera.position.x += size / 2.0;
        camera.position.y += size / 5.0;
        camera.position.z += size / 2.0;
        camera.lookAt( center );

        console.log( camera.position );

        controls.maxDistance = size * 10;
        controls.update();

        scene.add( gltf.scene );

    }, undefined, function ( e ) {

        console.error( e );

    } );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
    renderer.shadowMap.enabled = true;
    container.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );

    // stats
    stats = new Stats();
    container.appendChild( stats.dom );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

    requestAnimationFrame( animate );

    renderer.render( scene, camera );

    stats.update();

}