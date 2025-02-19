import * as THREE from "three"

// Blade
const x = 0, y = 0

const bladeShape = new THREE.Shape()
.moveTo( x + 2, y + 2.5 )
.bezierCurveTo( x + 2.5, y + 2.5, x + 2.0, y, x, y )
.bezierCurveTo( x - 3.0, y, x - 3.0, y + 3.5, x - 3.0, y + 3.5 )
.bezierCurveTo( x - 3.0, y + 5.5, x - 1.0, y + 7.7, x + 2.5, y + 10.5 )
.bezierCurveTo( x, y + 2.5, x + 2.5, y + 2.5, x + 2, y + 2.5 )

const extrudeSettings = {
  steps: 10,
  depth: 60,
}

// const shapeGeo = new THREE.ShapeGeometry(shape)
const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings)
bladeGeo.scale(0.07, 0.07, 0.07)
const bladeGeo2 = bladeGeo.clone()
const bladeGeo3 = bladeGeo.clone()

const bladeMat = new THREE.MeshBasicMaterial({color: "white", wireframe: false})

const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat)
const bladeMesh2 = new THREE.Mesh(bladeGeo2, bladeMat)
const bladeMesh3 = new THREE.Mesh(bladeGeo3, bladeMat)

const blades = []
blades.push(bladeMesh, bladeMesh2, bladeMesh3)

blades.forEach((blade) => {

  const positionAttribute = blade.geometry.attributes.position;
  
  // Find min and max Z values (to normalize step positions)
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (let i = 0; i < positionAttribute.count; i++) {
    const z = positionAttribute.getZ(i);
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  
  // Apply tapering effect by scaling XY based on Z
  for (let i = 0; i < positionAttribute.count; i++) {
    const z = positionAttribute.getZ(i);
    
    // Normalize z between 0 and 1 based on min/max
    const t = (z - minZ) / (maxZ - minZ); // 0 at base, 1 at top
    
    // Define tapering scale (1.0 at base, 0.5 at top)
    const scaleFactor = 1.0 - 0.9 * t; // Adjust 0.5 for more tapering
    
    // Scale X and Y based on taper factor
    positionAttribute.setX(i, positionAttribute.getX(i) * scaleFactor);
    positionAttribute.setY(i, positionAttribute.getY(i) * scaleFactor);
  }
  
  // Update geometry after modification
  positionAttribute.needsUpdate = true;
  blade.geometry.computeVertexNormals();
  blade.geometry.computeBoundingBox();
  blade.geometry.computeBoundingSphere();
  
  blade.rotation.y = Math.PI / 2
})

export {blades}