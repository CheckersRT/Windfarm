import { GLTFExporter } from "three/examples/jsm/Addons.js";
import { TextureUtils } from "three";
import * as THREE from "three"

export default function exportGLTF( input ) {

    console.log(input instanceof THREE.Object3D); // should be true


    const gltfExporter = new GLTFExporter().setTextureUtils( TextureUtils );

    const options = {
        trs: false,
        onlyVisible: true,
        binary: false,
		maxTextureSize: 4096
    };
    gltfExporter.parse(
        input,
        function ( result ) {

            if ( result instanceof ArrayBuffer ) {

                saveArrayBuffer( result, 'scene.glb' );

            } else {

                const output = JSON.stringify( result, null, 2 );
                console.log( output );
                saveString( output, 'scene.gltf' );

            }

        },
        function ( error ) {

            console.log( 'An error happened during parsing', error );

        },
        options
    );

}

const link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link ); // Firefox workaround, see #6594

function save( blob, filename ) {

    link.href = URL.createObjectURL( blob );
    link.download = filename;
    link.click();

    // URL.revokeObjectURL( url ); breaks Firefox...

}

function saveString( text, filename ) {

    save( new Blob( [ text ], { type: 'text/plain' } ), filename );

}


function saveArrayBuffer( buffer, filename ) {

    save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

}