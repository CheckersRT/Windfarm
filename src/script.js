import * as THREE from "three"
import GUI from 'lil-gui';
import { OrbitControls } from "three/examples/jsm/Addons.js"
import {foundation, tower} from "./windmill/tower"
import {turbineBody, turbineRotor, turbineCone, turRotorParams} from "./windmill/turbine"
import {Terrain} from "./terrain"
import { wind, animateWind, windParams } from "./wind/wind";
import setUpDebugGUI from "./debug";
import { createWindfarm, windfarmParams, windmills } from "./createWindfarm";

const canvas = document.querySelector("canvas.webgl")

let camera, scene, renderer, controls, gui

function init() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color( 0x222222 );

  // AcesHelper
  const axesHelper = new THREE.AxesHelper(4)
  scene.add(axesHelper)

  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200)
  camera.position.y = 17
  camera.position.z = 18
  camera.position.x = 12
  scene.add(camera)

  // Controls
  controls = new OrbitControls(camera, canvas)
  // controls.enabled = false
  controls.enableDamping = true
  controls.update()

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
  const {windmills, windmillHelpers} = createWindfarm()
  scene.add(...windmills)
  // scene.add(...windmillHelpers)

  // Wind
  scene.add(wind)

}

init()


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
    const speed = windParams.speed
    const windAngle = THREE.MathUtils.degToRad(windParams.direction);

    for(let i = 0; i < windfarmParams.quantity; i++) {
      windmills[i].children[4].rotateZ(-speed/3 * Math.cos(windAngle + 0.1))
    }
    animateWind(time)
    controls.update()
    camera.lookAt(wind.position)
    renderer.render(scene, camera)
}

export {gui}
