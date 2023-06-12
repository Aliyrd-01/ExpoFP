import { boothStore } from "./../../../store/index";
import * as THREE from "three";
import { Mesh } from "three";
import store from "../../../store";
import { RegularBooth } from "../../../store/BoothStore";
import { loadLogos } from "../../Mapbox/utils/data";
import TextureMerger, { modifySphereUV } from "../utils/textureMerger";
import { ICommonData } from "./dataLoader";
import logosFromBooths from "../../../utils/imageloader";
var { Text } = require("troika-three-text");

export default async function initTexts(threeLayers: Map<string, number>, scene: THREE.Scene, data: ICommonData) {
    var obj = new Map<string, THREE.Texture>();

    const logos = (await logosFromBooths(boothStore.booths as any)).filter((l) => !!l);

    logos.forEach((logo) => obj.set(logo.name, new THREE.Texture(logo.htmlImage)));

    var textureMerger = new TextureMerger(obj);

    var material = new THREE.MeshBasicMaterial();
    material.side = THREE.DoubleSide;
    material.transparent = true;

    boothStore.booths.forEach((booth) => {
        let layer = data.objLayers.find((l) => l.name === booth.layer?.name || "Default");

        console.info(data.objLayers, booth.layer?.name, layer);

        var exhibitor = (booth as RegularBooth)?.exhibitors?.find((e) => !!e.logo && e.logoInBooth);

        if (exhibitor) {
            var plane = new THREE.Mesh(new THREE.PlaneGeometry(booth.rect.w, booth.rect.h), material);
            scene.add(plane);

            plane.layers.set(threeLayers.get(booth.layer?.name));
            modifySphereUV(plane, textureMerger.ranges.get(booth.slug));
            plane.position.z = layer.z + layer.height + (layer.z + layer.height) * 0.01;
            plane.position.x = booth.rect.cx;
            plane.position.y = booth.rect.cy;
            plane.scale.y = -1;

            plane.material.map = textureMerger.mergedTexture;
        } else {
            const myText = new Text();
            scene.add(myText);

            myText.text = booth.name.substring(1);

            myText.fontSize = (1.7 * booth.rect.w) / myText.text.length;

            if (myText.fontSize > booth.rect.h) myText.fontSize *= booth.rect.h / myText.fontSize;

            myText.position.z = layer.z + layer.height + (layer.z + layer.height) * 0.01;
            myText.position.x = booth.rect.x1;
            myText.position.y = booth.rect.x1;
            myText.color = 0xffffff;
            myText.anchorX = "left";
            myText.anchorY = "top";
            myText.textAlign = "left";
            myText.scale.y = -1;

            let mesh = myText as Mesh;
            mesh.layers.set(threeLayers.get(booth.layer.name));
            myText.sync();
        }
    });
}
