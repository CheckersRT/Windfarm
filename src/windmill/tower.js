import * as THREE from "three"

// Foundation
const foundationParams = {
  width: 2,
  height: 0.2,
  depth: 2,
  widthSegments: 2,
  heightSegments: 1,
  depthSegments: 2,
}
const foundationGeo = new THREE.BoxGeometry(foundationParams.width, foundationParams.height, foundationParams.depth, foundationParams.widthSegments, foundationParams.heightSegments, foundationParams.depthSegments)
const foundationMat = new THREE.MeshBasicMaterial({color: "grey"})
const foundationMesh = new THREE.Mesh(foundationGeo, foundationMat)
foundationMesh.position.y = foundationParams.height / 2

export {foundationMesh as foundation}

// Tower
const towerParams = {
  height: 10,
}
const towerGeo = new THREE.CylinderGeometry(0.2, 0.45, towerParams.height, 10, 10)
const towerMat = new THREE.MeshBasicMaterial({color: "white"})
const towerMesh = new THREE.Mesh(towerGeo, towerMat)
towerMesh.position.y = towerParams.height / 2

export {towerMesh as tower}

