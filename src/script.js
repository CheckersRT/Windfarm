import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/Addons.js"
import { DragControls } from 'three/addons/controls/DragControls.js';
import { TransformControls } from "three/examples/jsm/Addons.js";
import {Terrain} from "./terrain.js"
import { Wind } from "./wind/wind.js";
import setUpDebugGUI from "./debug.js";
import { WindFarm } from "./windfarm.ts";
import {Windmill} from "./windmill/Windmill.js"

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
  scene.add(windmillTest.object)

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
  // scene.add(wind)

  // Drag controls
  const windmillObjs = windfarm.windmills.map((windmill) => (windmill.object))
  console.log("windmillObjs", windmillObjs);

  dragControls = new DragControls([...windmillObjs, windmillTest.object, sphere], camera, canvas)
  // dragControls.enabled = false

  transformControls = new TransformControls(camera, canvas)
  // transformControls.enabled = false
  transformControls.setMode("rotate")
  transformControls.attach(windmillTest.object)
  transformControls.setSize(1)
  transformControls.showX = false
  transformControls.showZ = false
  // transformControls.setSpace("local")
  transformControls.addEventListener("dragging-changed", (event) => {
    dragControls.enabled = !event.value
    orbitControls.enabled = !event.value
    console.log("tcontrols event", event, transformControls.rotationAngle);
    
  })  
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

function onMouseMove(event) {
  pointer.x = ( event.offsetX / window.innerWidth ) * 2 - 1;
  pointer.y = - ( event.offsetY / window.innerHeight ) * 2 + 1;
  const objects = windfarm.windmills.map((windmill) => windmill.object)
  
  const intersection = raycaster.intersectObjects(objects, true)
  // if(intersection.length > 0) {
  //   if(intersected != intersection[0].object) {
  //         if ( intersected ) {
  //           intersected.parent.children.forEach((child) => child.material.emissive.setHex( intersected.currentHex ))
  //         }
  //         intersected = intersection[0].object
  //         intersected.currentHex = intersected.material.emissive.getHex()
  //         intersected.parent.children.forEach((child) => {
  //           child.material.emissive.set( "green" )
  //         })          
  //       }
  //     } else {
  //       if (intersected) {
  //         intersected.parent.children.forEach((child) => child.material.emissive.setHex(intersected.currentHex))
  //       };        
  //       intersected = null;
  //     }
  

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
  // const object = event.object
  // const worldPos = new THREE.Vector3()
  // object.getWorldPosition(worldPos)
  
  // startingPos.set(object.uuid, worldPos.clone())

}

function onDrag(event) {
  const object = event.object
  console.log("object", object.position);
  
  object.position.y = object.name === "turbineRotor" ? 10 : 0

  // if(object.parent) {
  //   object.parent.position.x = object.position.x
  //   object.parent.position.z = object.position.z

  //   console.log("parent position", object.parent.position);
    
  //   object.position.set(0, 0, 0);
  // }

  

  if (object.parent) {
    
    const lastPosition = parentEndPos.get(object.parent.uuid) || {x: 0, y: 0, z: 0}
    console.log("lastPOSITION", lastPosition);
    

    object.parent.position.x = lastPosition.x + object.position.x
    object.parent.position.z = lastPosition.z + object.position.z

    console.log("parent position", object.parent.position);
    

    const children = object.parent.children

    object.position.set(0, 0, 0)

  // const newPosition = object.position.clone(); // Save new position

  // if (object.parent) {
  //   object.parent.position.add(newPosition);
    
  //   // Reset object's position so it's local to the new parent position
  //   object.position.set(0, 0, 0);
  // }

    // children.filter((child) => child.uuid !== object.uuid ).map((child) => {
    //   child.position.x = object.position.x
    //   child.position.z = child.name === "turbineRotor" ? object.position.z + 1.005 : object.position.z
    //   // child.position.set(0, 0, 0)
    // })
  }

  // transformControls._root.updateMatrixWorld()


  // console.log("x", object.position.x, "z", object.position.z)

  // const startPos = startingPos.get(object.uuid);
  // const child = object.parent.children[1];
  // const childStartPos = startingPos.get(child.uuid);

  // if (!startPos || !childStartPos) return;

  // // Compute object's current world position
  // const currentWorldPos = new THREE.Vector3();
  // object.getWorldPosition(currentWorldPos);

  // // Calculate the delta movement in world space
  // const deltaX = currentWorldPos.x - startPos.x;
  // const deltaZ = currentWorldPos.z - startPos.z;

  // // Apply the delta to the child's position in world space
  // const newChildPos = new THREE.Vector3(
  //   childStartPos.x + deltaX,
  //   child.position.y, // Keep Y unchanged
  //   childStartPos.z + deltaZ
  // );

  // child.position.copy(newChildPos);

  // console.log("Child Updated Pos:", newChildPos);


  // const child = object.parent.children[1]



  // const childWPos = startingPos.get(child.uuid)
  // // const childWPos = child.getWorldPosition(new THREE.Vector3())
  // // console.log("objWPos", objWPos, "childWPos", childWPos);
  
  // if(!childWPos) return

  // console.log("child world pos", childWPos)

  // const newX = childWPos.x + object.position.x
  // const newZ = childWPos.z + object.position.z
  // console.log("newX", newX, "newZ", newZ)

  // child.position.x = newX
  // child.position.z = newZ


  
  // const startPos = startingPos.get(object.uuid)
  // if (!startPos) return;
  
  // const rotationAngle = event.object.parent.rotation.y  

  // console.log("rotationAngle", rotationAngle);
  

  // const parent = event.object.parent

  // let localDeltaX = object.position.x
  // let localDeltaZ = object.position.z

  // const rotatedX = localDeltaX * Math.cos(rotationAngle) - localDeltaZ * Math.sin(rotationAngle);
  // const rotatedZ = localDeltaX * Math.sin(rotationAngle) + localDeltaZ * Math.cos(rotationAngle);
  
  
  // parent.position.x = startPos.x + rotatedX
  // parent.position.z = startPos.z + rotatedZ

  // object.position.set(0, object.position.y, 0);


  // const deltaX = parent.position.x - startPos.x
  // const deltaZ = parent.position.z - startPos.z

  // // relative to direction windmill is facing
  
  // object.position.x -= deltaX
  // object.position.z -= deltaZ
  
  orbitControls.enabled = false
  orbitControls.update()
}


function onDragEnd(event) {
  console.log("onDragEnd");
  
  const parent = event.object.parent
  const {x, y, z} = parent.position
  parentEndPos.set(parent.uuid, {x, y, z})
  // startingPos.delete(event.object.uuid);

  // const helper = transformControls.getHelper()
  // if (!helper) return; // Ensure helper exists
  
  // helper.position.x = event.object.position.x
  // helper.position.z = event.object.position.z

  // event.object.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(event.object.position.x, 0, event.object.position.z))
  
  // event.object.geometry.center()
  console.log("object drag end", event.object.position, event.object.parent.position);
  
  // transformControls.reset()

  // transformControls._root.updateMatrixWorld()


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
