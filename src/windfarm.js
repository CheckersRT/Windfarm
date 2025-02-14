import * as THREE from "three"

// Windmill
const windfarmParams = {
    quantity: 20,
    bufferScaleFactor: 8,
    bBoxArray: [],
    randomness: [],
  }

const windmill = new THREE.Group()
windmill.add(foundation, tower, turbineBody, turbineCone, turbineRotor)
// scene.add(windmill)

const windmillBBox = new THREE.Box3().setFromObject(windmill).expandByScalar(windfarmParams.bufferScaleFactor)
windfarmParams.bBoxArray.push(windmillBBox)
const helper = new THREE.Box3Helper( windmillBBox, 0xffff00 );
scene.add( helper );

for (let i = 0; i < windfarmParams.quantity; i++) {
    let isInsideBox = true
let isSafeDistAway = false
let proposedX = 0
let proposedZ = 0
let attempts = 0

function isPointInsideBox() {
    proposedX = (Math.random() - 0.5) * terrainParams.width
    proposedZ = (Math.random() - 0.5) * terrainParams.width

    const newTestBox = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(proposedX, 0, proposedZ), windmillBBox.getSize(new THREE.Vector3()))
    
    isSafeDistAway = windfarmParams.bBoxArray.every((box) => {
    const hasIntersection = newTestBox.intersectsBox(box)
        return !hasIntersection
    })    
    return isSafeDistAway
}

while (!isSafeDistAway) {
    isPointInsideBox()
    attempts++
}

if (attempts >= 10) {
    console.warn("You can't place any more windmills in this space. Expand the area to place more.");
}    

// Create new windmill

const newWindmill = windmill.clone()
newWindmill.position.set(proposedX, 0, proposedZ)
scene.add(newWindmill)

// new BoundingBox
const newWindmillBBox = new THREE.Box3().setFromObject(newWindmill).expandByScalar(windfarmParams.bufferScaleFactor)
const newHelper = new THREE.Box3Helper(newWindmillBBox, 0xffff00)
scene.add(newHelper)
windfarmParams.bBoxArray.push(newWindmillBBox)
}

// export {windfarm}