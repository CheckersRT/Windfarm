import * as THREE from "three"

// Terrain
const terrainParams = {
    width: 200,
    height: 200,
}

const terrainGeo = new THREE.PlaneGeometry(terrainParams.width, terrainParams.height, terrainParams.width, terrainParams.height)
const terrainMat = new THREE.MeshBasicMaterial({color: "green", wireframe: true, side: THREE.DoubleSide})
const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat)
terrainMesh.rotation.x = Math.PI / 2

export {terrainMesh as terrain, terrainParams}