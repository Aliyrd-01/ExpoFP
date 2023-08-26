import { Camera } from "three";

export default function ui(camera: Camera, thteeLayers: Map<string, number>) {
    const layersDiv = document.createElement("div");
    document.body.appendChild(layersDiv);

    layersDiv.style.position = "absolute";
    layersDiv.style.top = "10";
    layersDiv.style.right = "10";

    thteeLayers.forEach((layer, key) => {
        const layerButton = document.createElement("button");
        layersDiv.appendChild(layerButton);

        layerButton.innerText = key.substring(0, 2);
        layerButton.style.display = "block";
        layerButton.style.margin = "5px";
        layerButton.style.padding = "5px";
        layerButton.style.width = "30px";
        layerButton.style.height = "30px";
        layerButton.style.cursor = "pointer";

        layerButton.onclick = () => {
            (window as any)["changeLayer"](layer, !camera.layers.isEnabled(layer));
        };
    });
}
