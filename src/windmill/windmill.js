import * as THREE from "three"
import {foundation, tower} from "./tower"
import {turbineBody, turbineCone, turbineRotor} from "./turbine"
import Controller from "../controller"

class Windmill {
    bufferScaleFactor = 8

    constructor() {
        this.object = Windmill.baseWindmill.clone()
        this.boundingBox = this.createBBox(this.object)
        this.helper = this.createHelper(this.boundingBox)
    }

    static createBaseWindmill() {
        const baseWindmill = new THREE.Group()
        baseWindmill.add(foundation, tower, turbineBody, turbineCone, turbineRotor)
        return baseWindmill
    }
    static baseWindmill = Windmill.createBaseWindmill()
    static baseWindmillBBox = new THREE.Box3().setFromObject(Windmill.baseWindmill).expandByVector(new THREE.Vector3(8, 0, 8))
    static baseWindmillBBoxSize = Windmill.baseWindmillBBox.getSize(new THREE.Vector3())

    getBBoxSize() {
        return this.boundingBox.getSize(new THREE.Vector3())
    }

    createBBox(object) {
        return new THREE.Box3().setFromObject(object).expandByVector(new THREE.Vector3(8, 0, 8))
    }

    createHelper(box) {
        return new THREE.Box3Helper( box, 0xffff00 )
    }

    setPosition(x, y, z) {
        this.object.position.set(x, y, z)
    }

    animateRotation() {
        const controller = new Controller()
        const speed = controller.windSpeed
        const windAngle = THREE.MathUtils.degToRad(controller.windDirection);
        this.object.children[4].rotateZ(-speed/5 * Math.cos(windAngle * Math.random() + 0.1))
    }
}

export {Windmill}

