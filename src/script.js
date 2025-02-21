import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/Addons.js"
import { DragControls } from 'three/addons/controls/DragControls.js';
import { TransformControls } from "three/examples/jsm/Addons.js";
import {Terrain} from "./terrain.js"
import { Wind } from "./wind/wind.js";
import setUpDebugGUI from "./debug.js";
import { WindFarm } from "./windfarm.ts";
import {Windmill} from "./windmill/Windmill.js"
import { Blade } from "./windmill/Blade.js";

const canvas = document.querySelector("canvas.webgl")

let camera, scene, renderer, orbitControls, dragControls, transformControls, gui, wind, windfarm, raycaster

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
  // controls.enabled = false
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

  const windmillTest = new Windmill()
  const blade = new Blade()

  scene.add(windmillTest.object)
  windfarm = new WindFarm(20)
  
  scene.add(windfarm)

  // Wind
  wind = new Wind(1)
  // scene.add(wind)

  // Drag controls
  const windmillObjs = windfarm.windmills.map((windmill) => (windmill.object))
  console.log("windmillObjs", windmillObjs);

  dragControls = new DragControls([...windmillObjs, windmillTest.object], camera, canvas)
  transformControls = new TransformControls(camera, canvas)
  transformControls.setMode("rotate")
  transformControls.attach(windmillTest.object)
  transformControls.setSize(1)
  transformControls.showX = false
  transformControls.showZ = false
  transformControls.addEventListener("dragging-changed", (event) => {
    dragControls.enabled = !event.value
    orbitControls.enabled = !event.value
  })
  scene.add(transformControls.getHelper())

  raycaster = new THREE.Raycaster()

}

init()


const clickPosition = new THREE.Vector2()
window.addEventListener("click", onClick)

function onClick(event) {
  clickPosition.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	clickPosition.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  raycaster.setFromCamera(clickPosition, camera)
  const objects = windfarm.windmills.map((windmill) => windmill.object)
  console.log("objects in click", objects)

  const intersection = raycaster.intersectObjects(objects)
  if(intersection.length > 0) {
    console.log("intersection: ",  intersection, intersection[0].object.material)
    intersection[0].object.material.emissive.set( "red" );

  }
}

dragControls.addEventListener("drag", (event) => {
  const object = event.object
  object.position.y = 0
  const id = object.uuid
  const moveX = object.position.x
  const moveZ = object.position.z
  const parent = object.parent
  
  parent.children.map((child) => {
    if(child.uuid !== id) {
      child.position.x = moveX 
      child.position.z = child.name === "turbineRotor" ? moveZ + 1.005 : moveZ
    }
  })
  orbitControls.enabled = false
  orbitControls.update()
})

dragControls.addEventListener("dragend", (event) => {
  // if(event.shiftKey) return
  console.log("pointerup event", event, event.shiftKey)
  orbitControls.enabled = true
  orbitControls.update()
})


window.addEventListener("mousemove", (event) => {
  
  // if(!event.shiftKey) return
  console.log("SHIFTY SHITTY SHIFT")
})

window.addEventListener("click", (event) => {
  console.log("click event", event, event.shiftKey)
})


window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

window.addEventListener("dblclick", () => {
  const fullscreenElement = document.FullscreenElement || document.webkitFullscreenElement

  if(!fullscreenElement) {
      canvas.requestFullscreen()
  } else {
      document.exitFullscreen()
  }
})

function animate(time) {
    time = time / 1000
    windfarm.animate()  
    wind.animate(time)
    orbitControls.update()
    camera.lookAt(wind.position)
    renderer.render(scene, camera)
}

export {gui}
