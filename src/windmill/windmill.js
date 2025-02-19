import * as THREE from "three"
import {foundation} from "./tower"
import {turbineMesh, turbineRotor} from "./turbine"
import Controller from "../controller"
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

class Windmill {
    bBoxScaleVector = new THREE.Vector3(8, 0, 8)

    constructor() {
        this.object = Windmill.baseWindmill.clone()
        this.boundingBox = this.createBBox()
        this.helper = this.createHelper()
        console.log("in constructor", this.object)
    }

    static createBaseWindmill() {
        const baseWindmill = new THREE.Group()
        baseWindmill.add(turbineMesh, foundation, turbineRotor)
        return baseWindmill
    }
    static baseWindmill = Windmill.createBaseWindmill()

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
        this.object.children.find((child) => child.name === "turbineRotor").rotateZ(-speed/5 * Math.cos(windAngle * Math.random() + 0.1))
    }
}

export {Windmill}

