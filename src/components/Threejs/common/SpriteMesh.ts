import * as THREE from "three";

export class SpriteMesh extends THREE.Mesh {
    constructor(texture: string) {
        
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshBasicMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            alphaTest: 0.5,
        });

        var scale = 0.001;

        new THREE.TextureLoader().load(texture, (text) => {
            material.map = text;
            geometry.scale(text.image.width * scale, text.image.height * scale, 1);            
            geometry.rotateX(Math.PI * 0.5);
            
            material.needsUpdate = true;
        });

        super(geometry, material);

        this.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
            let { position } = camera.userData;

            //this.rotateY(camera.rotation.z);
        };
    }
}
