import mapboxgl from "mapbox-gl";
import { configureWebGLForMapbox } from "./configureWebGLForMapbox";

export default function initMapbox(container: HTMLElement, style: string): Promise<mapboxgl.Map> {
    return new Promise((resolve, reject) => {
        configureWebGLForMapbox();

        mapboxgl.accessToken =
            "pk.eyJ1Ijoicm9kaW9ubmlrb2xhZXYiLCJhIjoiY2wwanE5aXB4MDM2NTNibGExd3k4bHhsaiJ9.wdpy8dJ1qktQXGtZYDNH3w";

        const map = new mapboxgl.Map({
            container: container,
            style: `mapbox://styles/mapbox/${"light-v11"}`,
            //style: "mapbox://styles/mapbox/" + style,
            antialias: true,
            pitch: 30,
            maxPitch: 70,
        });

        map.on("load", () => resolve(map));
    });
}
