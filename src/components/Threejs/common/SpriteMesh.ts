import { lineAngle, round } from "simple-geometry";
import * as THREE from "three";

export class SpriteMesh extends THREE.Mesh {
    constructor(texture: string) {
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshBasicMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            alphaTest: 0.8,
            toneMapped: true,
            precision: "highp"            
        });

        var scale = 0.01;
        var prevAngle = 0;

        new THREE.TextureLoader().load(texture, (text) => {
            material.map = text;
            geometry.scale(text.image.width * scale, text.image.height * scale, 1);
            geometry.translate(0, (text.image.height * scale) / 2, 0);
            geometry.rotateX(Math.PI / 2);
            material.needsUpdate = true;
        });

        super(geometry, material);

        this.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
            let { position } = camera.userData;
            const angle = round(((lineAngle({ x: 0, y: 0 }, position) - 90) * Math.PI) / 180, 2);
            this.rotateZ(-1 * (angle - prevAngle));
            prevAngle = angle;
        };
    }
}
