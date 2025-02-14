import * as THREE from "three"
import GUI from "lil-gui"
import {Terrain} from "./terrain"
import {windParams, windArray, lineGeo, lineMat, wind, positionLinesInInstance, addWindInstance} from "./wind/wind"


function setUpDebugGUI() {
    const gui = new GUI()

    const terrain = new Terrain()
    const terrainMesh = terrain.terrain

    // gui.add(terrainMesh.geometry.parameters, "width").min(10).max(100).step(1).name("Area").onChange((value) => {
    //     terrainMesh.geometry.dispose()
    //     terrainMesh.geometry = new THREE.PlaneGeometry(value, value, value, value)
    // })

    gui.add(windParams, "elevation").name("Wind elevation").min(0).max(15).step(1).onChange((value) => {
        windArray.forEach((windInstance) => {
           windInstance.position.y = value
        })
    })
        /**
     * Line spacing x
     * Line spacing y
     * Line spacing z
     */
    gui.add(windParams, "lineSpacingX").name("Line spacing X").min(1).max(5).step(0.2).onChange((value) => {
        windArray.forEach((windInstance) => {
        
            const dummy = new THREE.Object3D()  
            for(let i = 0; i < windInstance.count; i++) {
                windInstance.getMatrixAt(i, dummy.matrix)
                dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)
                dummy.position.x = windParams.initialLineXPos[i] * value
                dummy.updateMatrix()
                windInstance.setMatrixAt(i, dummy.matrix)
            }         
            })
    })
    gui.add(windParams, "lineSpacingY").name("Line spacing Y").min(1).max(5).step(0.2).onChange((value) => {
        windArray.forEach((windInstance, i) => {
            
            const dummy = new THREE.Object3D()
            for (let i = 0; i < windInstance.count; i++) {
            windInstance.getMatrixAt(i, dummy.matrix)
            dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)
            dummy.position.y = windParams.initialLineYPos[i] * value
            dummy.updateMatrix()
            windInstance.setMatrixAt(i, dummy.matrix)
            }
        })
    })
    gui.add(windParams, "lineSpacingZ").name("Line spacing Z").min(1).max(7).step(0.2).onChange((value) => {
        windArray.forEach((windInstance, i) => {
            
            const dummy = new THREE.Object3D()
            for (let i = 0; i < windInstance.count; i++) {
            windInstance.getMatrixAt(i, dummy.matrix)
            dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)
            dummy.position.z = windParams.initialLineZPos[i] * value
            dummy.updateMatrix()
            windInstance.setMatrixAt(i, dummy.matrix)
            }
        })
    })

    gui.add(windParams, "speed").name("Wind speed").min(0.1).max(2).step(0.1)
    
    // Number of lines per wind
    // gui.add(windParams, "lineDensity").name("Line density").min(10).max(50).step(2).onChange((value) => {
    // // Extend randomness array
    // while (windParams.randomness.length < value) {
    //     windParams.randomness.push({ rndA: Math.random() - 0.5, rndB: Math.random() - 0.5, rndC: Math.random() - 0.5 });
    // }
    //     windArray.forEach((windInstance, instanceIndex) => {
    //         wind.remove(windInstance)
    //         const newInstance = new THREE.InstancedMesh(lineGeo, lineMat, value)

    //         positionLinesInInstance(newInstance)

    //         windArray[instanceIndex] = newInstance
    //         wind.add(newInstance)
    //     })
    // })

    gui.add(windParams, "windDensity").name("Wind density").min(1).max(10).step(1).onChange((value) => {
        addWindInstance(value)
    })

    gui.add(windParams, "direction").name("Wind direction").min(0).max(360).step(1)


    return gui
}



export default setUpDebugGUI
