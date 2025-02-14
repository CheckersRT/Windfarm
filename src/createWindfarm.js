import * as THREE from "three"
import {Terrain} from "./terrain"
import { Windmill } from "./windmill/windmill"

function createWindfarm() {
    const terrain = new Terrain()
    const windmills = []
    const windmillHelpers = []
    const windfarmParams = {
        quantity: 20,
        bBoxArray: [],
    }
    const bBoxSize = Windmill.baseWindmillBBoxSize
    function isPointInsideBox(x, z) {
        const newTestBox = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(x, 0, z), bBoxSize)
        const isSafeDistAway = windfarmParams.bBoxArray.every((box) => !newTestBox.intersectsBox(box))
        console.log(isSafeDistAway, "isSafeDistAway")
        return isSafeDistAway
    }
    for (let i = 0; i < windfarmParams.quantity; i++) {
        let isSafeDistAway = false
        let proposedX = 0
        let proposedZ = 0
        let attempts = 0
        
        while (!isSafeDistAway) {
            proposedX = (Math.random() - 0.5) * terrain.width
            proposedZ = (Math.random() - 0.5) * terrain.width
            isSafeDistAway = isPointInsideBox(proposedX, proposedZ)
            attempts++
            if (attempts >= 50) {
                console.log("You can't place any more windmills in this space. Expand the area to place more.");
                break
            }    
        }
        
        // Create new windmill
        const windmill = new Windmill()
        windmill.object.position.set(proposedX, 0, proposedZ)
        windmills.push(windmill.object)
        
        // Create new boundingBox & helper
        const windmillBBox = windmill.createBBox(windmill.object)
        const helper = windmill.createHelper(windmillBBox)

        windmillHelpers.push(helper)
        windfarmParams.bBoxArray.push(windmillBBox)
    }
    return {windmills, windmillHelpers}
    
}

export {createWindfarm}