import * as THREE from "three"
import {blade} from "./blade"

// Turbine body
const turBodyParams = {
    height: 1.75,
  }
  const turBodyGeo = new THREE.CylinderGeometry(0.3, 0.3, turBodyParams.height, 10, 10)
  const turBodyMat = new THREE.MeshBasicMaterial({color: "white"})
  const turBodyMesh = new THREE.Mesh(turBodyGeo, turBodyMat)
  turBodyMesh.rotation.x = Math.PI / 2
  turBodyMesh.position.y = 10
  
  export {turBodyMesh as turbineBody}

// Turbine rotor Group
const turRotorGroup = new THREE.Group()

// Turbine rotor
const turRotorParams = {
    height: 0.2,
    separationDist: 0.03,
    rotate: false,
    speed: -0.02,
}
const turRotorGeo = new THREE.CylinderGeometry(0.3, 0.3, turRotorParams.height, 10, 10)
const turRotorMat = new THREE.MeshBasicMaterial({color: "white", wireframe: true})
const turRotorMesh = new THREE.Mesh(turRotorGeo, turRotorMat)
turRotorMesh.rotation.x = Math.PI / 2
// turRotorMesh.position.z = turBodyParams.height / 2 + turRotorParams.separationDist + (turRotorParams.height / 2)

turRotorGroup.add(turRotorMesh)

// Blades
const blade2 = blade.clone()
blade2.quaternion.copy(new THREE.Quaternion().setFromEuler(new THREE.Euler((Math.PI / 3) * 2, Math.PI / 2, 0, "YXZ")));

const blade3 = blade.clone()
blade3.quaternion.copy(new THREE.Quaternion().setFromEuler(new THREE.Euler((Math.PI / 3) * 4, Math.PI / 2, 0, "YXZ")));

turRotorGroup.add(blade, blade2, blade3);

// Group position
turRotorGroup.position.z = turBodyParams.height / 2 + turRotorParams.separationDist + (turRotorParams.height / 2)
turRotorGroup.position.y = 10
  
export {turRotorGroup as turbineRotor, turRotorParams}

// Turbine Cone
const turConeParams = {
    height: 0.6,
  }
const turConeGeo = new THREE.ConeGeometry(0.3, turConeParams.height, 10, 10, false, 0, Math.PI * 2)
const turConeMat = new THREE.MeshBasicMaterial({color: "white", wireframe: false})
const turConeMesh = new THREE.Mesh(turConeGeo, turConeMat) 
turConeMesh.rotation.x = Math.PI / 2
turConeMesh.position.y = 10
turConeMesh.position.z = (turBodyParams.height / 2) + turRotorParams.separationDist + turRotorParams.height + (turConeParams.height / 2)

export {turConeMesh as turbineCone}




