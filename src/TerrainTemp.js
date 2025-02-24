import * as THREE from "three"

export default class Terrain {
    width = 100
    height = 100

    constructor() {
        this.terrainGeo = new THREE.PlaneGeometry(this.width, this.height, this.width, this.height)
        this.terrainMat = new THREE.MeshBasicMaterial({color: "green", wireframe: false, side: THREE.DoubleSide})
        this.terrain = new THREE.Mesh(this.terrainGeo, this.terrainMat)
        this.terrain.rotation.x = Math.PI / 2
    }

    
}
