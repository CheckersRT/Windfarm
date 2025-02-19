import * as THREE from "three"
import {blades} from "./blade"
import { towerGeo } from "./tower";
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

// Turbine body
const turBodyParams = {
  height: 1.75,
}

// Turbine rotor Group
const turRotorGroup = new THREE.Group()
turRotorGroup.name = "turbineRotor"

// Turbine rotor
const turRotorParams = {
    height: 0.2,
    separationDist: 0.03,
    rotate: false,
    speed: -0.02,
}
const turRotorGeo = new THREE.CylinderGeometry(0.3, 0.3, turRotorParams.height, 10, 10)
turRotorGeo.rotateX(Math.PI / 2)
turRotorGeo.translate(0, 10, 1.005)


blades[0].geometry.rotateZ(-Math.PI / 2)
blades[0].geometry.rotateX(Math.PI / 2)
blades[0].geometry.translate(0 , 10, 1.005)

blades[1].geometry.rotateZ(-Math.PI / 2)
blades[1].geometry.rotateX(Math.PI / 2)
blades[1].geometry.rotateZ((Math.PI / 3) * 2)
blades[1].geometry.translate(0 , 10, 1.005)

blades[2].geometry.rotateZ(-Math.PI / 2)
blades[2].geometry.rotateX(Math.PI / 2)
blades[2].geometry.rotateZ((Math.PI / 3) * 4)
blades[2].geometry.translate(0 , 10, 1.005)


const rotorGeoMerge = new BufferGeometryUtils.mergeGeometries([turRotorGeo.toNonIndexed(), blades[0].geometry, blades[1].geometry, blades[2].geometry])
console.log(rotorGeoMerge, "rotorGeoMerge");

const turRotorMat = new THREE.MeshBasicMaterial({color: "white", wireframe: false})
const turRotorMesh = new THREE.Mesh(rotorGeoMerge, turRotorMat)
// turRotorMesh.rotation.x = Math.PI / 2
// turRotorMesh.position.y = 10
turRotorMesh.name = "turbineRotor"

turRotorGroup.add(turRotorMesh)



// Turbine Cone
const turConeParams = {
  height: 0.6,
}

const turConeGeo = new THREE.ConeGeometry(0.3, turConeParams.height, 10, 10, false, 0, Math.PI * 2)
turConeGeo.rotateX(Math.PI / 2)
turConeGeo.translate(0, 10, (turBodyParams.height / 2) + turRotorParams.separationDist + turRotorParams.height + (turConeParams.height / 2))

const turBodyGeo = new THREE.CylinderGeometry(0.3, 0.3, turBodyParams.height, 10, 10)
turBodyGeo.rotateX(Math.PI / 2)
turBodyGeo.translate(0, 10, 0)

const turbineGeos = new BufferGeometryUtils.mergeGeometries([turConeGeo, turBodyGeo, towerGeo])
const turbineMat = new THREE.MeshBasicMaterial({color: "white"})
export const turbineMesh = new THREE.Mesh(turbineGeos, turbineMat)
export const checkThingy = 0
console.log("turbineMesh geo in turbine", turbineMesh)

export {turRotorMesh as turbineRotor, turRotorParams}