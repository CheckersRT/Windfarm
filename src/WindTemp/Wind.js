import * as THREE from "three"
import Terrain from "../Terrain.js";

// Texture
const canvas = document.createElement( 'CANVAS' );
    canvas.width = 64;
    canvas.height = 8;

const context = canvas.getContext( '2d' );

const gradient = context.createLinearGradient( 0, 0, 64, 0 );
		gradient.addColorStop( 0.0, 'rgba(255,255,255,0)' );
		gradient.addColorStop( 0.5, 'rgba(255,255,255,128)' );
		gradient.addColorStop( 1.0, 'rgba(255,255,255,0)' );
		context.fillStyle = gradient;
    context.fillRect( 0, 0, 64, 8 );

const texture = new THREE.CanvasTexture( canvas );

const terrain = new Terrain()


class WindLine extends THREE.Object3D {
    width = 20
    height = 0.5
    widthSegments = 30
    heightSegments = 1
    amplitude = 0.2; // Controls height of wave
    frequency = 2;   // Controls how tight the waves are
    speed = 6;       // Controls how fast the wave moves    

    constructor() {
        super()
        this.geometry = new THREE.PlaneGeometry(this.width, this.height, this.widthSegments, this.heightSegments)
        this.material = new THREE.MeshStandardMaterial({
            color: "white", 
            side: THREE.DoubleSide, 
            wireframe: false, 
            map: texture,
            transparent: true,
            depthWrite: false,
        })
        // this.geometry.rotateX(Math.PI / 2)
        this.linePosition = this.geometry.getAttribute("position")
        this.numVerticesInRow = this.widthSegments + 1
        
    }

    animateWave(time) {
        for (let i = 0; i < this.numVerticesInRow; i++) {

            let x = this.linePosition.getX(i)            
            // Get top and bottom index of plane so the both sides of the wave move together
            let topIndex = i
            let bottomIndex = i + this.numVerticesInRow
            let yTop = this.linePosition.getY(topIndex)
            let yBottom = this.linePosition.getY(bottomIndex)

            let z = this.amplitude * Math.cos(this.frequency * x + this.speed * time); // Smooth cosine wave

            this.linePosition.setXYZ(topIndex, x, yTop, z);
            this.linePosition.setXYZ(bottomIndex, x, yBottom, z);
        }    
        this.linePosition.needsUpdate = true
    }
}

class WindInstance extends THREE.Object3D {
    windArray = []
    stretchX = 10
    windDensity = 10
    elevation = 8
    lineSpacingX = 1
    initialLineXPos = []
    lineSpacingY = 2
    initialLineYPos = []
    lineSpacingZ = 3
    initialLineZPos = []
    windSpreadX = 10
    initialWindXPos = []
    windSpreadY = 0
    randomness = []
    minX = -terrain.width/2
    maxX = terrain.width/2
    speed = 0.1
    radius = null
    direction = 30
    dummy = new THREE.Object3D()

    constructor() {
        super()
        this.mesh = WindInstance.baseWind.clone()
        this.lineDensity = WindInstance.lineDensity
        this.positionLines(this.mesh)
        this.radius = this.getRadius()
        }

    static lineDensity = 10
    static baseLine = new WindLine()
    static baseWind = new THREE.InstancedMesh(WindInstance.baseLine.geometry, WindInstance.baseLine.material, WindInstance.lineDensity)  

    getRadius() {
        this.mesh.computeBoundingSphere()
        return this.mesh.boundingSphere.radius
    }

    positionLines(mesh) {
        for(let i = 0; i < mesh.count; i++) {
            this.randomness.push({ rndA: Math.random() - 0.5, rndB: Math.random() - 0.5, rndC: Math.random() - 0.5 });
            
            let {rndA, rndB, rndC} = this.randomness[i]
            
            this.dummy.position.set(
                rndA * 10, 
                rndB * 4,
                rndC * 20,
            )
            this.dummy.rotation.set(Math.PI / 2, 0 , 0)
            this.initialLineXPos.push(this.dummy.position.x)
            this.initialLineYPos.push(this.dummy.position.y)
            this.initialLineZPos.push(this.dummy.position.z)
            this.dummy.updateMatrix()
            mesh.setMatrixAt(i, this.dummy.matrix)
        }
        mesh.position.y = this.elevation
        mesh.instanceMatrix.needsUpdate = true;
    }

    animateLinePosition(time) {
        for (let i = 0; i < this.mesh.count; i++) {
    
            let { rndA, rndB } = this.randomness[i];
        
            this.mesh.getMatrixAt(i, this.dummy.matrix)
            this.dummy.matrix.decompose(this.dummy.position, this.dummy.quaternion, this.dummy.scale)
            let {x, y, z} = this.dummy.position
    
            // Modify position based on a cosine wave
            let zOffset = Math.cos(time * 2 + rndA) * 0.02; // Small wave motion
            let yOffset = Math.sin(time * 3 + rndB) * 0.02; // Slight vertical sway
    
            this.dummy.position.set(x, y + yOffset, z + zOffset);
            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(i, this.dummy.matrix);
        } 
        this.mesh.instanceMatrix.needsUpdate = true; // Update the instances
    }

    animateLineWave(time) {
        WindInstance.baseLine.animateWave(time)
    }

    animateDirection() {
        const angleRad = THREE.MathUtils.degToRad(this.direction);
        this.mesh.position.x += Math.cos(angleRad) * this.speed;
        this.mesh.position.z += Math.sin(angleRad) * this.speed;

        for(let i = 0; i < this.mesh.count; i++) {
            this.mesh.getMatrixAt(i, this.dummy.matrix)
            this.dummy.matrix.decompose(this.dummy.position, this.dummy.quaternion, this.dummy.scale)

            this.dummy.rotation.z = angleRad
            this.dummy.updateMatrix()
            this.mesh.setMatrixAt(i, this.dummy.matrix)
        }
        this.mesh.instanceMatrix.needsUpdate = true
    }

    loop() {
        const angleRad = THREE.MathUtils.degToRad(this.direction);
    
        const moveX = Math.cos(angleRad);
        const moveZ = Math.sin(angleRad);
    
        for (let i = 0; i < this.mesh.count; i++) {
            let { x, z } = this.mesh.position;
    
            let projectedPos = x * moveX + z * moveZ;
    
            if (projectedPos > this.maxX + this.radius) {
                // Move to the start position but maintain the same offset along the wind's movement axis
                this.mesh.position.x -= moveX * (this.maxX - this.minX + 2 * this.radius);
                this.mesh.position.z -= moveZ * (this.maxX - this.minX + 2 * this.radius);
            } 
    
            if (projectedPos < this.minX - this.radius) {
                // Move to the end position, maintaining offset
                this.mesh.position.x += moveX * (this.maxX - this.minX + 2 * this.radius);
                this.mesh.position.z += moveZ * (this.maxX - this.minX + 2 * this.radius);
            }
        }
    }
}

class Wind extends THREE.Group {
    array = []

    constructor(density = 5) {
        super()
        this.createWind(density)
    }
    createWind(density) {
        for (let i = 0; i < density; i++) {
            const windInstance = new WindInstance()
            this.add(windInstance.mesh)
            this.array.push(windInstance)
        }
    }
    addWind() {
        const windInstance = new WindInstance()
        this.add(windInstance.mesh)
    }
    removeWind() {
        this.remove(this.children[this.children.length-1])
    }

    animate(time) {
        this.array.forEach((windInstance) => {
            windInstance.animateLinePosition(time)
            windInstance.animateDirection()
            windInstance.animateLineWave(time)
            windInstance.loop(time)
        })
    }
}

const windParams = {
    stretchX: 10,
    lineDensity: 15,
    windDensity: 10,
    elevation: 8,
    lineSpacingX: 1,
    initialLineXPos: [],
    lineSpacingY: 2,
    initialLineYPos: [],
    lineSpacingZ: 3,
    initialLineZPos: [],
    windSpreadX: 10,
    initialWindXPos: [],
    windSpreadY: 0,
    randomness: [],
    minX: -terrain.width/2,
    maxX: terrain.width/2,
    speed: 0.1,
    radius: null,
    direction: 30,
}


export { windParams, Wind, WindInstance}
