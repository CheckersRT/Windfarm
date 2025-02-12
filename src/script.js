import * as THREE from "three"
import GUI from 'lil-gui';
import { OrbitControls } from "three/examples/jsm/Addons.js"
import {foundation, tower} from "./windmill/tower"
import {turbineBody, turbineRotor, turbineCone, turRotorParams} from "./windmill/turbine"
import {terrain} from "./terrain"
import { wind, animateWind, windParams } from "./wind/wind";
import setUpDebugGUI from "./debug";

const canvas = document.querySelector("canvas.webgl")

let camera, scene, renderer, controls, gui

function init() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color( 0x222222 );

  // AcesHelper
  const axesHelper = new THREE.AxesHelper(4)
  scene.add(axesHelper)

  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
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
  scene.add(terrain)
  
  // Windmill
  const numWindmills = 6
  const windmill = new THREE.Group()
  windmill.add(foundation, tower, turbineBody, turbineCone, turbineRotor)
  for (let i = 0; i < numWindmills; i++) {
    const newWindmill = windmill.clone()
    newWindmill.position.x = i * 6
    newWindmill.position.z = i * 6
    scene.add(newWindmill)
  }

  // Wind
  scene.add(wind)

}

init()

const makeWindButton = document.querySelector(".button")

makeWindButton.addEventListener("click", (event) => {
  turRotorParams.rotate = !turRotorParams.rotate
  if(turRotorParams.rotate === true) {
    makeWindButton.innerHTML = "Stop wind"
  } else {
    makeWindButton.innerHTML = "Make wind"
  }
})

window.addEventListener("resize", () => {
  camera.aspect = window.InnerWidth / window.InnerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.InnerWidth, window.InnerHeight)
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
  if(turRotorParams.rotate === true) {
    const speed = windParams.speed
    const windAngle = THREE.MathUtils.degToRad(windParams.direction);
    //rotation is slowest at 90 and 270 and fastest at 0, 180, 360
    //rotation is slowest at 0.25 and 0.75 and fastest at 0, 0.5, 1
    turbineRotor.rotateZ(-speed/3 * Math.cos(windAngle + 0.1))
  }
  animateWind(time)
  controls.update()
  camera.lookAt(wind.position)
  renderer.render(scene, camera)
}

export {gui}
