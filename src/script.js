import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/Addons.js"
import { DragControls } from 'three/addons/controls/DragControls.js';
import {Terrain} from "./terrain"
import { Wind } from "./wind/wind";
import setUpDebugGUI from "./debug";
import { WindFarm } from "./windfarm";
import { turbineMesh, turbineRotor } from "./windmill/turbine";
import {Windmill} from "./windmill/windmill"

const canvas = document.querySelector("canvas.webgl")

let camera, scene, renderer, orbitControls, dragControls, gui, wind, windfarm

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
  
  scene.add(windmillTest.object)
  windfarm = new WindFarm(20)
  console.log(windfarm);
  
  scene.add(windfarm)
  // scene.add(...windfarm.helpers)

  // Wind
  wind = new Wind(1)
  // scene.add(wind)

  // Drag controls
  const windmillObjs = windfarm.windmills.map((windmill) => (windmill.object))
  console.log("windmillObjs", windmillObjs);
  
  dragControls = new DragControls([...windmillObjs, windmillTest.object], camera, canvas)
}

init()

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
  console.log("pointerup event", event)
  orbitControls.enabled = true
  orbitControls.update()
})

window.addEventListener("click", (event) => {
  console.log("click event", event)
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
