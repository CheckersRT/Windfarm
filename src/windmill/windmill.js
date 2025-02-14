


// Windmill
const windmillParams = {
    bufferScaleFactor: 8,
  }

const windmill = new THREE.Group()
windmill.add(foundation, tower, turbineBody, turbineCone, turbineRotor)
const windmillBBox = new THREE.Box3().setFromObject(windmill).expandByScalar(windfarmParams.bufferScaleFactor)
const helper = new THREE.Box3Helper( windmillBBox, 0xffff00 );

// scene.add(windmill)


// export {windmill}