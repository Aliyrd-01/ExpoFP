import * as THREE from "three";
import { Mesh } from "three";
import { Booth } from "../../../store/BoothStore";
import { IBooth as ThreeBooth } from "../common/dataLoader";

import { getBoothlabel } from "../../Mapbox/utils/data";
import TextureMerger, { modifySphereUV } from "../utils/textureMerger";
var { Text } = require("troika-three-text");

export class BoothMesh extends THREE.Group {
    public constructor(
        public efpBooth: Booth,
        public threeBooth: ThreeBooth,
        public boothMesh: THREE.Object3D,
        public name: string,
        public threeLayer: number,
        public z: number,
        public scene: THREE.Scene
    ) {
        super();
        this.name = name;
        boothMesh.name = name;
        this.children.push(boothMesh);
    }

    public invertText() {}

    public setText() {
        const myText = new Text();

        this.scene.add(myText);

        myText.text = getBoothlabel(this.efpBooth);
        if (!myText.text) return;

        let mesh = myText as Mesh;

        const b = this.threeBooth;

        let maxDimension = Math.max(b.rect.width, b.rect.height);
        let minDimension = Math.min(b.rect.width, b.rect.height);

        myText.fontSize = (1.6 * maxDimension) / myText.text.length;

        if (myText.fontSize > minDimension) myText.fontSize *= minDimension / myText.fontSize;

        if (b.rect.width < b.rect.height) mesh.rotateZ(Math.PI / 2);

        myText.position.x = b.rect.center.x;
        myText.position.y = b.rect.center.y;
        myText.position.z = this.z;

        myText.color = 0xffffff;
        myText.anchorX = "center";
        myText.anchorY = "middle";
        myText.textAlign = "center";
        myText.scale.y = -1;
        mesh.name = this.name;
        mesh.layers.set(this.threeLayer);
        myText.sync();
    }

    public setLogo(textureMerger:TextureMerger, material:THREE.MeshBasicMaterial){
        var plane = new THREE.Mesh(new THREE.PlaneGeometry(this.threeBooth.rect.width, this.threeBooth.rect.height), material);
        this.scene.add(plane);
        plane.layers.set(this.threeLayer);

        modifySphereUV(plane, textureMerger.ranges.get(this.efpBooth.name));
        plane.position.x = this.threeBooth.rect.center.x;
        plane.position.y = this.threeBooth.rect.center.y;
        plane.position.z = this.z;
        plane.scale.y = -1;

        plane.material.map = textureMerger.mergedTexture;
        plane.name = this.efpBooth.name;
    }
}
