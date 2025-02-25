import * as THREE from "three"

export default class Terrain {
    width = 100
    height = 100

    constructor() {
        this.textureLoader = new THREE.TextureLoader()
        this.colorTexture = this.textureLoader.load("public/stylized-grass1-bl/stylized-grass1_albedo.png")
        this.colorTexture.colorSpace = THREE.SRGBColorSpace
        this.colorTexture.repeat.x = 50
        this.colorTexture.repeat.y = 50
        this.colorTexture.wrapT = THREE.MirroredRepeatWrapping
        this.colorTexture.wrapS = THREE.RepeatWrapping
        this.colorTexture.center.x = 0.5
        this.colorTexture.center.y = 0.5
        this.colorTexture.rotation = Math.PI / 3

        this.normalTexture = this.textureLoader.load("public/stylized-grass1-bl/stylized-grass1_normal-ogl.png")
        this.ambientOcclusionTexture = this.textureLoader.load("public/stylized-grass1-bl/stylized-grass1_ao.png")
        this.heightTexture = this.textureLoader.load("public/stylized-grass1-bl/stylized-grass1_height.png")
        this.metallicTexture = this.textureLoader.load("public/stylized-grass1-bl/stylized-grass1_metallic.png")
        this.roughnessTexture = this.textureLoader.load("public/stylized-grass1-bl/stylized-grass1_roughness.png")


        this.terrainGeo = new THREE.PlaneGeometry(this.width, this.height, 200, 200)
        this.terrainMat = new THREE.MeshBasicMaterial({color: "green", wireframe: false, side: THREE.DoubleSide, map: this.colorTexture})
        this.terrain = new THREE.Mesh(this.terrainGeo, this.terrainMat)
        this.terrain.rotation.x = Math.PI / 2
    }

    
}
