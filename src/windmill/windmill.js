import * as THREE from "three"
import {Turbine, RotorBlades} from "./Turbine.js"
import Controller from "../controller.js"
import {Foundation} from "./Foundation.js"

class Windmill {
    bBoxScaleVector = new THREE.Vector3(8, 0, 8)
    ranRotation = Math.random()

    constructor() {
        this.object = this.createWindmill()
        this.boundingBox = this.createBBox()
        this.helper = this.createHelper()
    }

    createWindmill() {
        const windmill = new THREE.Object3D()
        this.foundation = new Foundation()
        this.turbine = new Turbine()
        this.rotorBlades = new RotorBlades()
        windmill.add(this.turbine.mesh, this.foundation.mesh, this.rotorBlades.mesh)
        return windmill
    }

    getBBoxSize() {
        return this.boundingBox.getSize(new THREE.Vector3())
    }

    createBBox() {
        return new THREE.Box3().setFromObject(this.object).expandByVector(this.bBoxScaleVector)
    }

    createHelper() {
        return new THREE.Box3Helper( this.boundingBox, 0xffff00 )
    }

    setPosition(x, y, z) {
        this.object.position.set(x, y, z)
    }

    setBBoxPosition() {
        this.boundingBox.setFromObject(this.object).expandByVector(this.bBoxScaleVector)
    }

    animateRotation() {
        const controller = new Controller()
        const speed = controller.windSpeed
        const windAngle = THREE.MathUtils.degToRad(controller.windDirection); 
        this.object.rotation.reorder("YXZ")
        const windmillAngle = this.object.rotation.y
        
        const angleDiff = windAngle - windmillAngle
        const rotationFactor = Math.sin(angleDiff)        
        
        this.rotorBlades.mesh.rotateZ(-speed * rotationFactor)
    }
}

export {Windmill}

