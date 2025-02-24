import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/Addons.js"
import { DragControls } from "./Controls/DragControls.js";
import { TransformControls } from "three/examples/jsm/Addons.js";
import Terrain from "./Terrain.js"
import { Wind } from "./Wind/Wind.js";
import setUpDebugGUI from "./debug.js";
import WindFarm from "./Windfarm.ts";
import Windmill from "./Windmill/TempWindmill.js"

const canvas = document.querySelector("canvas.webgl")

let camera, scene, renderer
let orbitControls, dragControls, transformControls
let gui, raycaster, intersected, clicked
let wind, windfarm, windmillTest, cube, sphere

const startingPos = new Map()
const clickPos = new THREE.Vector2()
const pointer = new THREE.Vector2()

function init() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color( 0x222222 );

  // AcesHelper
  const axesHelper = new THREE.AxesHelper(4)
  // scene.add(axesHelper)

  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200)
  camera.position.y = 17
  camera.position.z = 18
  camera.position.x = 12
  scene.add(camera)

  // Controls
  orbitControls = new OrbitControls(camera, canvas)
  // orbitControls.enabled = false
  orbitControls.enableDamping = true
  orbitControls.update()

  // DebugGUI
  setUpDebugGUI()

  // Light
  const light = new THREE.PointLight( 0xffffff, 3, 0, 0 );
	light.position.copy( camera.position );
	scene.add( light );
  
  // Render
  renderer = new THREE.WebGLRenderer({canvas})
  renderer.setPixelRatio( Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setAnimationLoop(animate)

  // Terrain
  const terrain = new Terrain()
  const terrainMesh = terrain.terrain
  scene.add(terrainMesh)
  
  // Windfarm
  windmillTest = new Windmill()
  // scene.add(windmillTest.object)

  windfarm = new WindFarm(20)
  scene.add(windfarm)


  const cubeGeo = new THREE.BoxGeometry(2,2,2)
  const cubeMat = new THREE.MeshBasicMaterial({color: "purple"})
  cube = new THREE.Mesh(cubeGeo, cubeMat)
  // scene.add(cube)

  const sphereGeo = new THREE.SphereGeometry(1,4, 4)
  sphereGeo.applyMatrix4(new THREE.Matrix4().makeTranslation(-5, 0, 0))
  const spheremat = new THREE.MeshBasicMaterial({color: "orange"})
  sphere = new THREE.Mesh(sphereGeo, spheremat)

  sphere.add(cube)
  // scene.add(sphere)



  // Wind
  wind = new Wind(1)
  scene.add(wind)

  // Drag controls
  const windmillObjs = windfarm.windmills.map((windmill) => (windmill.object))
  console.log("windmillObjs", windmillObjs);

  dragControls = new DragControls([...windmillObjs, windmillTest.object, sphere], camera, canvas)
  dragControls.transformGroup = true  

  transformControls = new TransformControls(camera, canvas)
  // transformControls.enabled = false
  transformControls.setMode("rotate")
  transformControls.setSize(1)
  transformControls.showX = false
  transformControls.showZ = false
  scene.add(transformControls.getHelper())

  raycaster = new THREE.Raycaster()

}

init()



document.addEventListener("mousemove", onMouseMove)
document.addEventListener("click", onClick)
window.addEventListener("resize", onResize)
window.addEventListener("dblclick", onDblClick)

dragControls.addEventListener("drag", onDrag)
dragControls.addEventListener("dragstart", onDragStart)
dragControls.addEventListener("dragend", onDragEnd)

transformControls.addEventListener("dragging-changed", onRotate)  

function onRotate(event) {
    dragControls.enabled = !event.value
    orbitControls.enabled = !event.value
}

function onMouseMove(event) {
  pointer.x = ( event.offsetX / window.innerWidth ) * 2 - 1;
  pointer.y = - ( event.offsetY / window.innerHeight ) * 2 + 1;
  const objects = windfarm.windmills.map((windmill) => windmill.object)
  
  const intersection = raycaster.intersectObjects(objects, true)
}

function onClick(event) {
  clickPos.x = ( event.offsetX / window.innerWidth ) * 2 - 1;
  clickPos.y = - ( event.offsetY / window.innerHeight ) * 2 + 1;

  const objects = windfarm.windmills.map((windmill) => windmill.object)
  const intersection = raycaster.intersectObjects(objects, true)

  if(intersection.length > 0) {
    if(clicked != intersection[0].object) {
      if(clicked) {
        // sets previous clicked back to normal colour
        clicked.parent.children.forEach((child) => child.material.emissive.setHex( clicked.currentHex ))
      }
      clicked = intersection[0].object
      clicked.currentHex = clicked.material.emissive.getHex()
      clicked.parent.children.forEach((child) => {
        child.material.emissive.set( "blue" )
      })
      transformControls.attach(clicked.parent)
      console.log("rotation angle?", transformControls._quaternionStart);
      

    } else if (clicked == intersection[0].object) {
      clicked.parent.children.forEach((child) => child.material.emissive.set(clicked.currentHex))
      transformControls.detach(clicked.parent)
      clicked = null

    }
  } else {
    if(clicked) {
      clicked.parent.children.forEach((child) => child.material.emissive.set(clicked.currentHex))
      transformControls.detach(clicked.parent)
    }
    clicked = null
  }

}

const parentEndPos = new Map()

function onDragStart(event) {  
}

function onDrag(event) {
  const object = event.object
  console.log("object", object.position);
  
  object.position.y = object.name === "turbineRotor" ? 10 : 0
  
  orbitControls.enabled = false
  orbitControls.update()
}


function onDragEnd(event) {
  console.log("onDragEnd");
  
  const parent = event.object.parent
  const {x, y, z} = parent.position
  parentEndPos.set(parent.uuid, {x, y, z})
  
  orbitControls.enabled = true
  orbitControls.update()
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}



function onDblClick() {
  const fullscreenElement = document.FullscreenElement || document.webkitFullscreenElement

  if(!fullscreenElement) {
      canvas.requestFullscreen()
  } else {
      document.exitFullscreen()
  }
}

function animate(time) {
    time = time / 1000
    windfarm.animate()  
    wind.animate(time)
    render()
  }
  
function render() {
    
  raycaster.setFromCamera( pointer, camera );
  // const intersection = raycaster.intersectObject(cube, true)
  // let intersected
  // if(intersection.length > 0) {
  //   console.log("intersection", intersection[0].object);
    
  // }


  // if(intersection.length > 0) {
  //   if(intersected != intersection[0].object) {
  //     if ( intersected ) {
  //       intersected.material.emissive.setHex( intersected.currentHex )
  //       console.log("intersected 2nd if", intersected);
  //     }
  //     intersected = intersection[0].object
  //     console.log("intersected", intersected);
  //     intersected.currentHex = intersected.material.emissive.getHex()
  //     console.log("currentHex", intersected.currentHex);
  //     intersected.material.emissive.set( "green" );
      
  //   }
  // } else {
  //   console.log("intersection = 0", intersection, intersected);
    
  //   if (intersected) {
  //     intersected.material.emissive.setHex( intersected.currentHex )
  //     console.log("current Hex in else", intersected.currentHex);
  //   };
    
  //   intersected = null;
  // }


  orbitControls.update()
  camera.lookAt(wind.position)
  renderer.render(scene, camera)

}

export {gui}
