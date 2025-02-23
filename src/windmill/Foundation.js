import * as THREE from "three"

export class Foundation extends THREE.Object3D {
  width = 2
  height = 0.2
  depth = 2
  widthSegments = 2
  heightSegments = 1
  depthSegments = 2

  constructor() {
    super()
    this.geometry = new THREE.BoxGeometry(this.width, this.height, this.depth, this.widthSegments, this.heightSegments, this.depthSegments)
    this.material = new THREE.MeshLambertMaterial({color: "grey"})
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    // this.mesh.position.y = this.height / 2
    this.mesh.name = "foundation"
  }
}
