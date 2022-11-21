import { Feature, FeatureCollection } from "geojson";
import { GeoJSONSource, Map } from "mapbox-gl";
import Rect from "../../../core/Rect";
import { Booth, RegularBooth, SpecialBooth } from "../../../store/BoothStore";
import settings from "../../../tools/settings";
import { bearing } from "../../../utils/geolib";
import { Layer } from "../../../store/LayerStore";
import mapboxgl from "mapbox-gl";
import { convertPoint } from "./trannsformations";
import store from "../../../store";
import RouteStore from "../../../store/RouteStore";
import Color from "color";

interface ExtendFeatureCollection extends FeatureCollection {
    properties: any;
}

const fpGeo = window["__fpGeo"] as ExtendFeatureCollection;

type Polygon = GeoJSON.FeatureCollection<GeoJSON.Polygon>;
enum featureTypes {
    "booth" = "booth",
    "building" = "building",
    "other" = "other",
}
function getBearing() {
    var parts = fpGeo?.properties?.mpViewbox;
    var bear = fpGeo?.properties?.bearing;
    let b = bear != null ? bear : -1 * bearing(parts[1], parts[0], parts[3], parts[2]) - 90;
    if (Math.abs(b) >= 360) b = 180;
    return b;
}

function getViewbox(): Rect {
    var xMin = 1000;
    var yMin = 1000;

    var xMax = -1000;
    var yMax = -1000;

    var data = fpGeo as Polygon;

    var features = data.features.filter((f) => f.properties.type === featureTypes.booth);

    (Array.isArray(features) ? features : [features]).forEach((feature) => {
        var coords = feature.geometry.coordinates[0];

        for (let index = 1; index < coords.length; index++) {
            const coord = coords[index];

            if (coord[0] < xMin) xMin = coord[0];
            if (coord[1] < yMin) yMin = coord[1];

            if (coord[0] > xMax) xMax = coord[0];
            if (coord[1] > yMax) yMax = coord[1];
        }
    });

    if (xMin === 1000) {
        var parts = window["__fpGeo"]?.properties?.mpViewbox;
        var x = [parts[0], parts[2], parts[4]];
        var y = [parts[1], parts[3], parts[5]];

        return Rect.fromX1y1x2y2(Math.min(...x), Math.min(...y), Math.max(...x), Math.max(...y));
    }

    return Rect.fromX1y1x2y2(xMin, yMin, xMax, yMax);
}

function getStyle(): string {
    return fpGeo?.properties?.style || "light-v10";
}

function actualBoothColor(b: Booth) {
    let defColor: string;
    if (b instanceof SpecialBooth) {
        defColor = b.color || settings.colors.booths.empty;
    } else if (b instanceof RegularBooth) {
        const settingsColors = settings.colors.booths;
        if (b.onHold) {
            defColor = b.holdColor || b.soldColor || settingsColors.default;
        } else if (b.exhibitors.length || b.reserved) {
            defColor = b.soldColor || settingsColors.default;
        } else {
            defColor = b.availColor || settingsColors.empty;
        }
    }

    if (defColor === "#666" || defColor === "#666666") defColor = "rgba(0,0,0,0.172)";

    return defColor;
}

function decimalToHex(input: string) {
    var h = parseInt(input).toString(16);
    return h.length === 1 ? "0" + h : h;
}

export const props = {
    token: "pk.eyJ1Ijoicm9kaW9ubmlrb2xhZXYiLCJhIjoiY2wwanE5aXB4MDM2NTNibGExd3k4bHhsaiJ9.wdpy8dJ1qktQXGtZYDNH3w",
    initBearing: settings.EXPO.indexOf("expoexpo") > -1 ? getBearing() - 30 : 0,
    initPitch: 45,
    bearing: getBearing(),
    viewbox: getViewbox(),
    style: getStyle(),
    edgeZoom: 19,
    extrusion: {
        building: 5,
        booths: 1,
        other: 0.5,
    },
};

const isDark = props.style.indexOf("dark") > -1;

const lineStyle = isDark
    ? ["interpolate", ["linear"], ["line-progress"], 0, "#ff9e2c", 0.5, "lime", 1, "#30afeb"]
    : [
          "interpolate",
          ["linear"],
          ["line-progress"],
          0,
          Color("#ff9e2c").darken(0.3).hex(),
          0.5,
          Color("lime").darken(0.3).hex(),
          1,
          Color("#30afeb").darken(0.3).hex(),
      ];

export function convertSvgPoint(x: number, y: number) {
    return convertPoint(x, y, fpGeo.properties.config);
}

export function setDataSource(map: Map, booths: Booth[]) {
    fpGeo.features.forEach((f: Feature) => {
        f.properties.id = f.properties.id?.substring(1);

        f.properties.height = props.extrusion[f.properties.type] || props.extrusion.booths;

        if (f.properties.type === featureTypes.booth) {
            let booth = booths.filter((b) => b.name === f.properties.id)[0];
            f.properties.color = actualBoothColor(booth);
            f.properties.description = booth.noLabels
                ? null
                : ((booth as RegularBooth)?.exhibitors || [])[0]?.name || booth.title || booth.name;
        } else {
            let color = f.properties.color;
            f.properties.color = `#${decimalToHex(color.R || color.r)}${decimalToHex(color.G || color.g)}${decimalToHex(
                color.B || color.b
            )}`;
        }
    });

    return map.addSource("data", { type: "geojson", data: fpGeo });
}

export function updateHoverDataSource(map: Map, hoveredBooths: Booth[], allBooths: Booth[]) {
    fpGeo.features.forEach((f: Feature) => {
        if (f.properties.type === featureTypes.booth) {
            var b = allBooths.find((booth) => booth.name === f.properties.id);

            if (hoveredBooths.indexOf(b) > -1) f.properties.height = 4 * props.extrusion.booths;
            else f.properties.height = props.extrusion.booths;
        }
    });

    (map.getSource("data") as GeoJSONSource).setData(fpGeo);
}

export function updateSelectionDataSource(map: Map, selectedBooths: Booth[], allBooths: Booth[]) {
    fpGeo.features.forEach((f: Feature) => {
        if (f.properties.type === featureTypes.booth) {
            var b = allBooths.find((booth) => booth.name === f.properties.id);

            if (selectedBooths.length && selectedBooths.indexOf(b) === -1) f.properties.color = isDark ? "#222" : "#DDD";
            else f.properties.color = actualBoothColor(b);
        }
    });

    (map.getSource("data") as GeoJSONSource).setData(fpGeo);
}

export function setBoothsLayers(map: Map, layers: Layer[]): string[] {
    const layersNames: string[] = [];

    layers.forEach((layer) => {
        var layerBooths = fpGeo.features.filter(
            (feature) => feature.properties.type === featureTypes.booth && feature.properties.layer === layer.name
        );

        if (layerBooths.length) {
            layersNames.push(layer.name);
            map.addLayer({
                id: layer.name,
                type: "fill-extrusion",
                source: "data",
                filter: ["all", ["in", "type", featureTypes.booth], ["in", "layer", layer.name]],
                layout: {
                    visibility: layer.visible ? "visible" : "none",
                },
                paint: {
                    "fill-extrusion-color": ["get", "color"],
                    "fill-extrusion-height": ["get", "height"],
                    "fill-extrusion-base": 0,
                    "fill-extrusion-opacity": 0.8,
                },
            });
        }
    });

    return layersNames;
}

export function setBoothsLabelsLayers(map: Map, layers: Layer[]) {
    map.addLayer({
        id: "labels",
        type: "symbol",
        source: "data",
        minzoom: 19,

        layout: {
            "text-field": ["get", "description"],
            "text-rotation-alignment": "viewport",
            "text-pitch-alignment": "viewport",
            "text-size": 14,
        },
        paint: {
            "text-color": settings.boothLabelColor,
        },
    });
}

export function setOthersLayer(map: Map): string {
    map.addLayer({
        id: "other",
        type: "fill",
        source: "data",
        filter: ["in", "type", featureTypes.other],
        paint: {
            "fill-color": ["get", "color"],
        },
    });

    return "venues";
}

export function setVenuesLayer(map: Map): string {
    map.addLayer({
        id: "venues",
        type: "fill-extrusion",
        source: "data",
        filter: ["in", "type", featureTypes.building],
        paint: {
            "fill-extrusion-color": ["get", "color"],
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": 0,
            "fill-extrusion-opacity": ["interpolate", ["linear", 0.5], ["zoom"], 16, 0.9, 18, 0.1],
        },
    });

    return "venues";
}

let markersObject = {};
export function setMarker(map: Map, type: "from" | "to" | "yah", point: Point) {
    var marker = markersObject[type];

    if (!point) {
        marker?.remove();
        markersObject[type] = null;
        return;
    }

    const { x, y } = point;
    const lngLat = convertPoint(x, y, fpGeo.properties.config);

    if (!marker) {
        var htmlElement = document.createElement("div");
        htmlElement.className = `marker ${type}`;
        marker = new mapboxgl.Marker(htmlElement).setLngLat(lngLat);
        marker.addTo(map);
        markersObject[type] = marker;
    }

    marker.setLngLat(lngLat);
}

// Wayfinding
export function setWayfindingLayer(map: Map) {
    map.addSource("wfData", {
        type: "geojson",
        lineMetrics: true,
        data: null,
    });

    map.addLayer({
        id: "wf",
        type: "line",
        source: "wfData",
        minzoom: 2,
        paint: {
            "line-color": "#30afeb",
            "line-width": 3,
            "line-gradient": lineStyle as any,
            "line-gap-width": 2,
        },
        layout: {
            "line-cap": "round",
            "line-join": "round",
        },
    });
}

export function updateRouteLines(map: Map, routeStore: RouteStore) {
    var wayfindingData = map.getSource("wfData") as GeoJSONSource;
    if (!wayfindingData) {
        setWayfindingLayer(map);
        wayfindingData = map.getSource("wfData") as GeoJSONSource;
    }

    var routeLines = routeStore.routeLines.filter((line) => {
        let visible = store.layerStore.layers.find((l) => l.name === line.p0.layer)?.visible ?? true;
        return !line.virtual && visible;
    });

    var firstPoint = routeLines[0]?.p0;
    var lastPoint = routeLines[routeLines.length - 1]?.p1;

    var points = [];
    if (lastPoint) {
        points = routeLines.map((rl) => convertPoint(rl.p0.x, rl.p0.y, fpGeo.properties.config));
        points.push(convertPoint(lastPoint.x, lastPoint.y, fpGeo.properties.config));
    }

    var fc: FeatureCollection = {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                properties: {},

                geometry: {
                    type: "LineString",
                    coordinates: points,
                },
            },
        ],
    };

    wayfindingData.setData(fc);
    setMarker(map, "from", lastPoint);
    setMarker(map, "to", firstPoint);
}
