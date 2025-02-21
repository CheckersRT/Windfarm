import * as THREE from "three"
import {Turbine, RotorBlades} from "./Turbine.js"
import Controller from "../controller.js"
import {Foundation} from "./Foundation.js"

class Windmill {
    bBoxScaleVector = new THREE.Vector3(8, 0, 8)

    constructor() {
        this.object = this.createWindmill()
        this.boundingBox = this.createBBox()
        this.helper = this.createHelper()
        console.log("in constructor", this.object)
    }

    createWindmill() {
        const windmill = new THREE.Group()
        const foundation = new Foundation()
        const turbine = new Turbine()
        const rotorBlades = new RotorBlades()
        windmill.add(turbine.mesh, foundation.mesh, rotorBlades.mesh)
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
        if(this.object.length > 1) {
            this.object.children.find((child) => child.name === "turbineRotor").rotateZ(-speed/5 * Math.cos(windAngle * Math.random() + 0.1))
        }
    }
}

export {Windmill}

