import * as THREE from "three"
import {Blade} from "./Blade.js"
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

export class Turbine {
   constructor() {
    this.tower = new Tower()
    this.body = new TurbineBody()
    this.rotor = new RotorBlades()
    this.cone = new TurbineCone(this.body, this.rotor)

    this.geometry = new BufferGeometryUtils.mergeGeometries([this.tower, this.body.geometry, this.cone]) // cone is causing problems
    this.material = new THREE.MeshLambertMaterial({color: "white"})
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.name = "turbine"
   }
}

class Tower {
  height = 10

  constructor() {
    const geometry = new THREE.CylinderGeometry(0.2, 0.45, this.height, 10, 10)
    geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, this.height / 2, 0))
    return geometry
  }
}

class TurbineBody {
  height = 1.75

  constructor() {
    this.geometry = new THREE.CylinderGeometry(0.3, 0.3, this.height, 10, 10)
    this.geometry.rotateX(Math.PI / 2)
    this.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 10, 0))
  }
}


class TurbineCone {
  height = 0.6
  
  constructor(body, rotor) {
    console.log("body", body, "rotor", rotor);
    
    const geometry = new THREE.ConeGeometry(0.3, this.height, 10, 10, false, 0, Math.PI * 2)
    geometry.rotateX(Math.PI / 2)
    const offsetZ = (body.height / 2) + rotor.separationDist + rotor.height + (this.height / 2)
    geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 10, offsetZ))

    return geometry
  }
}

export class RotorBlades extends THREE.Object3D {
  height = 0.2
  separationDist = 0.03
  rotate = false
  speed = -0.02
  blades = []

  constructor() {
    super()
    this.body = new THREE.CylinderGeometry(0.3, 0.3, this.height, 10, 10)
    this.body.rotateX(Math.PI / 2)
    this.blades = Array.from({ length: 3 }, () => new Blade())
    this.setBladePositions(this.blades)
    this.geometry = new BufferGeometryUtils.mergeGeometries([
      this.body.toNonIndexed(), 
      this.blades[0].geometry, 
      this.blades[1].geometry, 
      this.blades[2].geometry
    ])
    this.material = new THREE.MeshLambertMaterial({color: "white", wireframe: false})
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.name = "turbineRotor"
    this.mesh.position.y = 10
    this.mesh.position.z = 1.005
  }

  setBladePositions(blades) {
    blades.forEach((blade, i) => {
      switch (i) {
        case 1:
          blade.geometry.rotateZ((Math.PI / 3) * 2)
          break;
        case 2:
          blade.geometry.rotateZ((Math.PI / 3) * 4)
      }
    })
  }
}
