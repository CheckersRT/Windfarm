import * as THREE from "three"
import {Terrain} from "./terrain"
import { Windmill } from "./windmill/Windmill"

class WindFarm extends THREE.Group {
    quantity = 10
    windmills: Windmill[] = []
    boundingBoxes: any = []
    helpers: any = []

    constructor(quantity = 10) {
        super()
        this.createWindFarm(quantity)
    }

    createWindFarm(quantity) {
        this.quantity = quantity
        for (let i = 0; i < quantity; i++) {
            this.addNew()
        }
        this.name = "Windfarm"
    }

    createWindmill() {
        return new Windmill()
    }

    addNew() {
        const windmill = this.createWindmill()
        const {safe, x, z} = this.findSafePosition(windmill)
        if(!safe) {
            console.warn("Too bad, not enough room for anymore windmills.")
            return
        } 
        windmill.setPosition(x, 0, z)
        windmill.setBBoxPosition()
        this.addToFarm(windmill, windmill.boundingBox, windmill.helper)
    }

    addToFarm(windmill, boundingBox?, helper?) {
        this.windmills.push(windmill)
        this.add(windmill.object)
        this.boundingBoxes.push(boundingBox)
        this.helpers.push(helper)

    }
    removeWindmill() {

    }

    findSafePosition(windmill: Windmill) {
        let isSafeDistAway = false
        let x = 0
        let z = 0
        let attempts = 0
        const terrain = new Terrain()
        
        while (!isSafeDistAway) {
            x = (Math.random() - 0.5) * terrain.width
            z = (Math.random() - 0.5) * terrain.width
            isSafeDistAway = this.doesBoxIntersect(windmill, x, z)
            attempts++
        }
        if (attempts >= 50) {
            console.log("You can't place any more windmills in this space. Expand the area to place more.");
            return {safe: false, x: 0, z: 0}
        }    

        return {safe: true, x, z}
    }
    doesBoxIntersect(windmill: Windmill, x, z) {
        const newTestBox = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(x, 0, z), windmill.getBBoxSize())        
        const isSafeDistAway = this.boundingBoxes.every((box) => !newTestBox.intersectsBox(box))
        return isSafeDistAway
    }

    animate() {
        this.windmills.forEach((windmill) => {
            windmill.animateRotation()
        })
    }
}


export {WindFarm}



// place windmills where you want, where the most wind is / according to the terrain to try and generate the most electricity