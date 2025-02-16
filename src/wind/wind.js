import * as THREE from "three"
import { Terrain } from "../terrain";
import { xor } from "three/tsl";

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

class WindLine {
    width = 20
    height = 0.5
    widthSegments = 30
    heightSegments = 1
    amplitude = 0.2; // Controls height of wave
    frequency = 2;   // Controls how tight the waves are
    speed = 6;       // Controls how fast the wave moves    

    constructor() {
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

    setPosition() {

    }

    animateWave(time) {
        for (let i = 0; i < this.numVerticesInRow; i++) {

            let x = this.linePosition.getX(i)            
            // Get top and bottom index of plane so the both sides of the wave move together
            let topIndex = i
            let bottomIndex = i + this.numVerticesInRow
            let yTop = this.linePosition.getY(topIndex)
            let yBottom = this.linePosition.getY(bottomIndex)
            console.log("yBottom", yBottom);

            let z = this.amplitude * Math.cos(this.frequency * x + this.speed * time); // Smooth cosine wave

            this.linePosition.setXYZ(topIndex, x, yTop, z);
            this.linePosition.setXYZ(bottomIndex, x, yBottom, z);
        }
        // this.geometry.setAttribute("position", this.linePosition);
    
        this.linePosition.needsUpdate = true
    }
}



const lineGeoParams = {
    width: 20,
    height: 0.5,
    widthSegments: 30,
    heightSegments: 1,
}

// Create a single wind line
const lineGeo = new THREE.PlaneGeometry(lineGeoParams.width, lineGeoParams.height, lineGeoParams.widthSegments, lineGeoParams.heightSegments)
const lineMat = new THREE.MeshStandardMaterial({
    color: "white", 
    side: THREE.DoubleSide, 
    wireframe: false, 
    map: texture,
    transparent: true,
    depthWrite: false,
})

console.log("lineGeo", lineGeo, "from class", new WindLine().geometry)

const wind = new THREE.Group()
const terrain = new Terrain()
const windArray = []
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

const lineFromClass = new WindLine()


// Create the instancedMesh that will copy the lines
const windInstance = new THREE.InstancedMesh(lineFromClass.geometry, lineFromClass.material, windParams.lineDensity)
const windInstance2 = new THREE.InstancedMesh(lineGeo, lineMat, windParams.lineDensity)
const dummy = new THREE.Object3D()

// Position of lines
function positionLinesInInstance(instance) {
    const dummy = new THREE.Object3D()

    for(let i = 0; i < instance.count; i++) {
        windParams.randomness.push({ rndA: Math.random() - 0.5, rndB: Math.random() - 0.5, rndC: Math.random() - 0.5 });
        
        let {rndA, rndB, rndC} = windParams.randomness[i]
        
        dummy.position.set(
            rndA * 10, 
            rndB * 4,
            rndC * 10,
        )
        dummy.rotation.set(Math.PI / 2, 0 , 0)
        windParams.initialLineXPos.push(dummy.position.x)
        windParams.initialLineYPos.push(dummy.position.y)
        windParams.initialLineZPos.push(dummy.position.z)
        dummy.updateMatrix()
        instance.setMatrixAt(i, dummy.matrix)
    }
    instance.position.y = windParams.elevation
    // instance.rotation.y = 1
    instance.instanceMatrix.needsUpdate = true;
}
windInstance.computeBoundingSphere()
windParams.radius = windInstance.boundingSphere.radius

positionLinesInInstance(windInstance)
// windArray.push(instancedLines)

// Position of wind instance

const addWind = (quantity, currentWDensity) => {
    const numNewWind = quantity - currentWDensity
    for (let i = 0; i < numNewWind; i++) {
        const newInstance = windInstance.clone()
        
        newInstance.position.x = i * -15
        newInstance.instanceMatrix.needsUpdate = true;
        
        windArray.push(newInstance)
        wind.add(newInstance)
    }
}
const removeWind = (quantity, currentWDensity) => {
    const numToRemove = currentWDensity - quantity
    for (let i = 0; i < numToRemove; i++) {
        wind.remove(windArray[windArray.length-1])
        windArray.pop()
    }
}
function addWindInstance(quantity) {

    const currentWDensity = windArray.length
    if(quantity > currentWDensity) {
        addWind(quantity, currentWDensity)
    } else {
        removeWind(quantity, currentWDensity)
    }


}
addWindInstance(windParams.windDensity)

for(let i = 0; i < windArray.length; i++) {    
    wind.add(windArray[i])
}

const amplitude = 0.2; // Controls height of wave
const frequency = 2;   // Controls how tight the waves are
const speed = 6;       // Controls how fast the wave moves

const numColumns = lineGeoParams.widthSegments + 1; // (widthSegments + 1)
const lineGeoPos = lineGeo.getAttribute("position")

function animateLineWaves(time) {
    
    for (let i = 0; i < numColumns; i++) {

        let x = lineGeoPos.getX(i)

        // Get top and bottom index of plane so the both sides of the wave move together
        let topIndex = i
        let bottomIndex = i + numColumns
        let yTop = lineGeoPos.getY(topIndex)
        let yBottom = lineGeoPos.getY(bottomIndex)
        let z = amplitude * Math.cos(frequency * x + speed * time); // Smooth cosine wave
        
        // Apply the same z position to both top and bottom vertices
        lineGeoPos.setXYZ(topIndex, x, yTop, z);
        lineGeoPos.setXYZ(bottomIndex, x, yBottom, z);
        
    }
    lineGeo.setAttribute("position", lineGeoPos);

    lineGeoPos.needsUpdate = true
}

function animateLines(time, windInstance) {
    for (let i = 0; i < windInstance.count; i++) {

        let { rndA, rndB } = windParams.randomness[i];
    
        windInstance.getMatrixAt(i, dummy.matrix)
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)
        let {x, y, z} = dummy.position

        // Modify position based on a cosine wave
        let zOffset = Math.cos(time * 2 + rndA) * 0.02; // Small wave motion
        let yOffset = Math.sin(time * 3 + rndB) * 0.02; // Slight vertical sway

        dummy.position.set(x, y + yOffset, z + zOffset);
        dummy.updateMatrix();
        windInstance.setMatrixAt(i, dummy.matrix);
    } 
    windInstance.instanceMatrix.needsUpdate = true; // Update the instances
}

function loop(windInstance) {

    const angleRad = THREE.MathUtils.degToRad(windParams.direction);

    const moveX = Math.cos(angleRad);
    const moveZ = Math.sin(angleRad);

    for (let i = 0; i < windInstance.count; i++) {
        let { x, z } = windInstance.position;

        // Project onto the movement axis to check loop conditions
        let projectedPos = x * moveX + z * moveZ;

        if (projectedPos > windParams.maxX + windParams.radius) {
            // Move to the start position but maintain the same offset along the wind's movement axis
            windInstance.position.x -= moveX * (windParams.maxX - windParams.minX + 2 * windParams.radius);
            windInstance.position.z -= moveZ * (windParams.maxX - windParams.minX + 2 * windParams.radius);
        } 

        if (projectedPos < windParams.minX - windParams.radius) {
            // Move to the end position, maintaining offset
            windInstance.position.x += moveX * (windParams.maxX - windParams.minX + 2 * windParams.radius);
            windInstance.position.z += moveZ * (windParams.maxX - windParams.minX + 2 * windParams.radius);
        }
    }
}

function animateSpeed(deltaTime, windInstance) {
        // Convert angle from degrees to radians
        const angleRad = THREE.MathUtils.degToRad(windParams.direction);

        // Move the wind instance in the direction of the angle
        windInstance.position.x += Math.cos(angleRad) * windParams.speed;
        windInstance.position.z += Math.sin(angleRad) * windParams.speed;

        const dummy = new THREE.Object3D()
        for(let i = 0; i < windInstance.count; i++) {
            windInstance.getMatrixAt(i, dummy.matrix)
            dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)

            dummy.rotation.z = angleRad
            dummy.updateMatrix()
            windInstance.setMatrixAt(i, dummy.matrix)
        }
        windInstance.instanceMatrix.needsUpdate = true
}

const windLine = new WindLine()

function animateWind(time) {
    time = time / 1000; 

    console.log(windLine);
    
    windLine.animateWave(time)
    // animateLineWaves(time)
    
    for(let i = 0; i < windArray.length; i++) {
        animateLines(time, windArray[i])
        animateSpeed(time, windArray[i])
        loop(windArray[i])
    }


}

export {wind, animateWind, windParams, windArray, lineGeo, lineMat, positionLinesInInstance, addWindInstance}
