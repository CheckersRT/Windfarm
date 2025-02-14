import * as THREE from "three"
import {foundation, tower} from "./tower"
import {turbineBody, turbineCone, turbineRotor} from "./turbine"

class Windmill {
    bufferScaleFactor = 8

    constructor() {
        this.object = this.cloneWindmill(Windmill.baseWindmill)
    }

    static createBaseWindmill() {
        const baseWindmill = new THREE.Group()
        baseWindmill.add(foundation, tower, turbineBody, turbineCone, turbineRotor)
        return baseWindmill
    }
    static baseWindmill = Windmill.createBaseWindmill()
    static baseWindmillBBox = new THREE.Box3().setFromObject(Windmill.baseWindmill).expandByVector(new THREE.Vector3(8, 0, 8))
    static baseWindmillBBoxSize = Windmill.baseWindmillBBox.getSize(new THREE.Vector3())

    cloneWindmill(windmill) {
        return windmill.clone()
    }

    getBBoxSize(windmill) {
        console.log(typeof windmill, windmill)
        return windmill.getSize(new THREE.Vector3())
    }

    createBBox(object) {
        return new THREE.Box3().setFromObject(object).expandByVector(new THREE.Vector3(8, 0, 8))
    }

    createHelper(box) {
        return new THREE.Box3Helper( box, 0xffff00 )
    }

    setPosition(x, y, z) {
        this.windmill.position.set(x, y, z)
    }
}

export {Windmill}

