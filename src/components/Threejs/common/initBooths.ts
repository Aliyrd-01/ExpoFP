import * as THREE from "three";
import { Mesh } from "three";
import { RegularBooth } from "../../../store/BoothStore";
import { boothStore } from "../../../store/index";
import logosFromBooths from "../../../utils/imageloader";
import { getBoothlabel } from "../../Mapbox/utils/data";
import TextureMerger, { modifySphereUV } from "../utils/textureMerger";
import { ICommonData } from "./dataLoader";
import Scene from "./Scene";
var { Text } = require("troika-three-text");

export default async function initBooths(scene: Scene, data: ICommonData) {
    var textureObj = new Map<string, THREE.Texture>();

    const logos = (await logosFromBooths(boothStore.booths as any)).filter((l) => !!l);

    logos.forEach((logo) => textureObj.set(logo.name, new THREE.Texture(logo.htmlImage)));

    var textureMerger = new TextureMerger(textureObj);

    var material = new THREE.MeshBasicMaterial();
    material.side = THREE.DoubleSide;
    material.transparent = true;

    boothStore.booths.forEach((booth) => {
        let layer = data.objLayers.find((l) => l.name === booth.layer?.name);
        let z = layer.z + layer.height + (layer.z + layer.height) * 0.001;

        var exhibitor = (booth as RegularBooth)?.exhibitors?.find((e) => !!e.logo && e.logoInBooth);

        let b = data.booths.find((b) => b.name === booth.name);

        if (exhibitor) {
            var plane = new THREE.Mesh(new THREE.PlaneGeometry(b.rect.width, b.rect.height), material);
            scene.add(plane);
            plane.layers.set(scene.objLayers.get(b.layer));

            modifySphereUV(plane, textureMerger.ranges.get(booth.slug));
            plane.position.x = b.rect.center.x;
            plane.position.y = b.rect.center.y;
            plane.position.z = z;
            plane.scale.y = -1;

            plane.material.map = textureMerger.mergedTexture;
            plane.name = booth.name;
        } else {
            const myText = new Text();
            scene.add(myText);

            myText.text = getBoothlabel(booth);
            if (!myText.text) return;

            let mesh = myText as Mesh;

            let maxDimension = Math.max(b.rect.width, b.rect.height);
            let minDimension = Math.min(b.rect.width, b.rect.height);

            myText.fontSize = (1.6 * maxDimension) / myText.text.length;

            if (myText.fontSize > minDimension) myText.fontSize *= minDimension / myText.fontSize;

            if (b.rect.width < b.rect.height) mesh.rotateZ(Math.PI / 2);

            myText.position.x = b.rect.center.x;
            myText.position.y = b.rect.center.y;
            myText.position.z = z;

            myText.color = 0xffffff;
            myText.anchorX = "center";
            myText.anchorY = "middle";
            myText.textAlign = "center";
            myText.scale.y = -1;
            mesh.name = booth.name;
            mesh.layers.set(scene.objLayers.get(b.layer));
            myText.sync();
        }
    });
}
