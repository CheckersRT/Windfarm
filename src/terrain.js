import * as THREE from "three"

// Terrain
const terrainParams = {
    width: 40,
    height: 40,
}

const terrainGeo = new THREE.PlaneGeometry(terrainParams.width, terrainParams.height, 10, 10)
const terrainMat = new THREE.MeshBasicMaterial({color: "green", wireframe: false, side: THREE.DoubleSide})
const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat)
terrainMesh.rotation.x = Math.PI / 2

export {terrainMesh as terrain, terrainParams}