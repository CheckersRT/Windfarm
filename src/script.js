import * as THREE from "three"
import GUI from 'lil-gui';
import { OrbitControls } from "three/examples/jsm/Addons.js"
import {foundation, tower} from "./windmill/tower"
import {turbineBody, turbineRotor, turbineCone, turRotorParams} from "./windmill/turbine"
import {terrain, terrainParams} from "./terrain"
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
  scene.add(terrain)
  
  // Windmill
  const windmillParams = {
    quantity: 20,
    bufferScaleFactor: 8,
    bBoxArray: [],
    randomness: [],
  }
  const windmill = new THREE.Group()
  windmill.add(foundation, tower, turbineBody, turbineCone, turbineRotor)
  // scene.add(windmill)

  const windmillBBox = new THREE.Box3().setFromObject(windmill).expandByScalar(windmillParams.bufferScaleFactor)
  windmillParams.bBoxArray.push(windmillBBox)
  const helper = new THREE.Box3Helper( windmillBBox, 0xffff00 );
  scene.add( helper );
  
  for (let i = 0; i < windmillParams.quantity; i++) {
        let isInsideBox = true
    let isSafeDistAway = false
    let proposedX = 0
    let proposedZ = 0
    let attempts = 0
   
    function isPointInsideBox() {
      proposedX = (Math.random() - 0.5) * terrainParams.width
      proposedZ = (Math.random() - 0.5) * terrainParams.width
    
      const newTestBox = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(proposedX, 0, proposedZ), windmillBBox.getSize(new THREE.Vector3()))
      
      isSafeDistAway = windmillParams.bBoxArray.every((box) => {
        const hasIntersection = newTestBox.intersectsBox(box)
         return !hasIntersection
      })    
      return isSafeDistAway
    }
    
    while (!isSafeDistAway) {
      isPointInsideBox()
      attempts++
    }
    
    if (attempts >= 10) {
      console.warn("You can't place any more windmills in this space. Expand the area to place more.");
    }    

    // Create new windmill
    
    const newWindmill = windmill.clone()
    newWindmill.position.set(proposedX, 0, proposedZ)
    scene.add(newWindmill)

    // new BoundingBox
    const newWindmillBBox = new THREE.Box3().setFromObject(newWindmill).expandByScalar(windmillParams.bufferScaleFactor)
    const newHelper = new THREE.Box3Helper(newWindmillBBox, 0xffff00)
    scene.add(newHelper)
    windmillParams.bBoxArray.push(newWindmillBBox)
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
    turbineRotor.rotateZ(-speed/3 * Math.cos(windAngle + 0.1))
  }
  animateWind(time)
  controls.update()
  camera.lookAt(wind.position)
  renderer.render(scene, camera)
}

export {gui}
