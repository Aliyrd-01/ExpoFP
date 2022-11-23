import { Feature, FeatureCollection } from "geojson";
import { GeoJSONSource, Map } from "mapbox-gl";
import Rect from "../../../core/Rect";
import { Booth, RegularBooth, SpecialBooth } from "../../../store/BoothStore";
import settings from "../../../tools/settings";
import { bearing } from "../../../utils/geolib";
import { Layer } from "../../../store/LayerStore";
import mapboxgl from "mapbox-gl";
import { convertPoint } from "./trannsformations";
import store, { uiState } from "../../../store";
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

let markersObject = {};

let map: Map;

export function loadLogos(): Promise<void> {
    return new Promise<void>((accept, reject) => {
        map.loadImage(
            "data:image/png;base64,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",
            (error, result) => {
                if (!error) {
                    map.addImage("expofp", result);
                    accept();
                }
            }
        );
    });
}

export function setMap(m: Map) {
    map = m;
}

export function convertSvgPoint(x: number, y: number) {
    return convertPoint(x, y, fpGeo.properties.config);
}

export function moveToRect(svgRect: Rect) {
    var off = svgRect.w;
    var p1 = convertSvgPoint(svgRect.x1 - off, svgRect.y1 - off);
    var p2 = convertSvgPoint(svgRect.x2 + off, svgRect.y2 + off);

    map.fitBounds([p1, p2], {
        essential: true,
        duration: 1000,
        pitch: props.initPitch,
        bearing: props.initBearing,
    });
}

export function setDataSource(booths: Booth[]) {
    fpGeo.features.forEach((f: Feature) => {
        f.properties.id = f.properties.id?.substring(1);

        f.properties.height = props.extrusion[f.properties.type] || props.extrusion.booths;

        if (f.properties.type === featureTypes.booth) {
            let booth = booths.filter((b) => b.name === f.properties.id)[0];
            f.properties.color = actualBoothColor(booth);
            f.properties.description = booth.noLabels
                ? null
                : ((booth as RegularBooth)?.exhibitors || [])[0]?.name || booth.title || booth.name;

            if (booth.name === "1117") f.properties.logo = "expofp";
        } else {
            let color = f.properties.color;
            f.properties.color = `#${decimalToHex(color.R || color.r)}${decimalToHex(color.G || color.g)}${decimalToHex(
                color.B || color.b
            )}`;
        }
    });

    updateSelectionDataSource([...uiState.selectedBooths], store.boothStore.booths);
    updateRouteLines(store.routeStore);
    

    return map.addSource("data", { type: "geojson", data: fpGeo });
}

export function updateHoverDataSource(hoveredBooths: Booth[], allBooths: Booth[]) {
    fpGeo.features.forEach((f: Feature) => {
        if (f.properties.type === featureTypes.booth) {
            var b = allBooths.find((booth) => booth.name === f.properties.id);

            if (hoveredBooths.indexOf(b) > -1) f.properties.height = 4 * props.extrusion.booths;
            else f.properties.height = props.extrusion.booths;
        }
    });

    (map.getSource("data") as GeoJSONSource)?.setData(fpGeo);
}

export function updateSelectionDataSource(selectedBooths: Booth[], allBooths: Booth[]) {
    fpGeo.features.forEach((f: Feature) => {
        if (f.properties.type === featureTypes.booth) {
            var b = allBooths.find((booth) => booth.name === f.properties.id);

            if (selectedBooths.length && selectedBooths.indexOf(b) === -1) {
                f.properties.color = isDark ? "#222" : "#DDD";
                f.properties.opacity = 0;
            } else {
                f.properties.color = actualBoothColor(b);
                f.properties.opacity = 1;
            }
        }
    });

    (map.getSource("data") as GeoJSONSource)?.setData(fpGeo);
}

export function setBoothsLayers(layers: Layer[]): string[] {
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

export function setBoothsLabelsLayers(layers: Layer[]) {
    map.addLayer({
        id: "labels",
        type: "symbol",
        source: "data",
        minzoom: 19,

        layout: {
            "text-field": ["get", "description"],
            "text-size": 14,
            "icon-image": ["get", "logo"],
            "icon-anchor": "bottom",
            "icon-size": 0.25,
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
            "icon-offset": [0, props.extrusion.booths * -50],
        },
        paint: {
            "text-opacity": ["get", "opacity"],
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

export function setMarker(type: "from" | "to" | "yah", point: Point) {
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

export function updateRouteLines(routeStore: RouteStore) {
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
    setMarker("from", lastPoint);
    setMarker("to", firstPoint);
}
