import { FeatureCollection } from 'geojson';
interface ImageData {
    layer: string;
    data: string;
    points: [][];
}

interface ExtendFeatureCollection extends FeatureCollection {
    properties: any;
    images: ImageData[];
}


export const fpGeo = window["__fpGeo"] as ExtendFeatureCollection;