import * as THREE from "three"
import {Terrain} from "./terrain"
import { Windmill } from "./windmill/windmill"

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
        for (let i = 0; i < quantity; i++) {
            const windmill = new Windmill()
            console.log(windmill);
            
            const {x, z} = this.findSafePosition(windmill)
            windmill.setPosition(x, 0, z)
            this.addWindmillToFarm(windmill)
            this.helpers.push(windmill.helper)
            this.boundingBoxes.push(windmill.boundingBox)
        }
    }

    addWindmillToFarm(windmill) {
        this.windmills.push(windmill)
        this.add(windmill.object)
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
            if (attempts >= 50) {
                console.log("You can't place any more windmills in this space. Expand the area to place more.");
                break
            }    
        }
        return {x, z}
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