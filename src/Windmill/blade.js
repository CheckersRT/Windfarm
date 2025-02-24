import * as THREE from "three"

export class Blade {
  extrudeSettings = {
    steps: 10,
    depth: 60,
  }

  constructor() {
    this.shape = this.createShape()
    this.geometry = new THREE.ExtrudeGeometry(this.shape, this.extrudeSettings)
    this.geometry.scale(0.07, 0.07, 0.07)
    this.createTaper()
    this.geometry.rotateY(Math.PI / 2)
    this.geometry.name = "blade"
    this.material = new THREE.MeshLambertMaterial({color: "white"})
    this.mesh = new THREE.Mesh(this.geometry, this.material)
  }

  createShape() {
    const shape = new THREE.Shape()
      .moveTo( 2, 2.5 )
      .bezierCurveTo( 2.5, 2.5, 2.0, 0, 0, 0 )
      .bezierCurveTo( -3.0, 0, -3.0, 3.5, -3.0, 3.5 )
      .bezierCurveTo( -3.0, 5.5, -1.0, 7.7, 2.5, 10.5 )
      .bezierCurveTo( 0, 2.5, 2.5, 2.5, 2, 2.5 )
    return shape
  }

  createTaper() {
    const position = this.geometry.attributes.position;
  
  // Find min and max Z values (to normalize step positions)
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (let i = 0; i < position.count; i++) {
    const z = position.getZ(i);
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  
  // Apply tapering effect by scaling XY based on Z
  for (let i = 0; i < position.count; i++) {
    const z = position.getZ(i);
    
    // Normalize z between 0 and 1 based on min/max
    const t = (z - minZ) / (maxZ - minZ); // 0 at base, 1 at top
    
    // Define tapering scale (1.0 at base, 0.5 at top)
    const scaleFactor = 1.0 - 0.9 * t; // Adjust 0.5 for more tapering
    
    // Scale X and Y based on taper factor
    position.setX(i, position.getX(i) * scaleFactor);
    position.setY(i, position.getY(i) * scaleFactor);
  }
  position.needsUpdate = true;

}
}

