import { Point, Rect } from "simple-geometry";

export interface IObjLayer {
    name: string;
    z: number;
    height: number;
}

export interface ConfigPoint extends Point {
    lat: number;
    lng: number;
}

export interface GeoConfig {
    center: [number, number];
    bearing: number;
    style: string;
}

export interface ICommonData {
    viewbox: Rect;
    area: Rect;
    geoConfig: GeoConfig;
    objLayers: IObjLayer[];
}

export default async function dataLoader(expo: string): Promise<ICommonData> {
    return new Promise(async (resolve, reject) => {
        let response = await fetch(`models/${expo}/model.json`);
        let data = (await response.json()) as ICommonData;
        resolve(data);
    });
}
