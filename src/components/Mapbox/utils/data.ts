import { Img } from "./../../../utils/imageloader";
import Color from "color";
import { Feature, FeatureCollection } from "geojson";
import mapboxgl, { GeoJSONSource, Map } from "mapbox-gl";
import Rect from "../../../core/Rect";
import { svgArea } from "../../../data/svg";
import store, { uiState } from "../../../store";
import { Booth, RegularBooth, SpecialBooth } from "../../../store/BoothStore";
import { Layer } from "../../../store/LayerStore";
import RouteStore from "../../../store/RouteStore";
import settings from "../../../tools/settings";
import { bearing } from "../../../utils/geolib";
import logosFromBooths from "../../../utils/imageloader";
import { convertPoint } from "./trannsformations";

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
        booths: 0.5,
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

export async function loadLogos(booths: RegularBooth[]): Promise<Img[]> {
    const logos = (await logosFromBooths(booths)).filter((l) => !!l);
    logos.forEach((image) => map.addImage(image.name, image.htmlImage));
    return logos;
}

export function setMap(m: Map) {
    map = m;
}

export function convertSvgPoint(x: number, y: number) {
    return convertPoint(x, y, fpGeo.properties.config);
}

export function moveToRect(
    svgRect: Rect,
    paddingPercent: number = 100,
    duration: number = 1000,
    pitch: number = props.initPitch,
    bearing: number = props.initBearing
) {
    const padding = (paddingPercent / 100) * Math.max(Math.abs(svgRect.x2 - svgRect.x1), Math.abs(svgRect.y2 - svgRect.y1)) || 0;

    var p1 = convertSvgPoint(svgRect.x1 - padding, svgRect.y1 - padding);
    var p2 = convertSvgPoint(svgRect.x2 + padding, svgRect.y2 + padding);

    map.fitBounds([p1, p2], {
        essential: true,
        duration,
        pitch,
        bearing,
    });
}

export function switchViewbox(showMapbox: boolean) {
    let duration = 1200;

    if (showMapbox) {
        if (uiState.selectedBooths.size) {
            moveToRect(Rect.fromMultiple([...uiState.selectedBooths].map((b) => b.rect)));
        } else {
            uiState.moveToRect = store.layerStore.rectangle || svgArea;
        }
    } else {
        uiState.moveToRect = store.layerStore.rectangle || svgArea;
        moveToRect(svgArea, 0, duration, 0, props.bearing);
    }

    store.mapboxStore.mapBoxSelected = showMapbox;
}

export function setDataSource(booths: Booth[], logos: Img[]) {
    const avgHeight = logos.map((l) => l.htmlImage.height).reduce((a, b) => a + b, 0) / logos.length;
    const avgArea = logos.map((l) => l.bounds.width * l.bounds.height).reduce((a, b) => a + b, 0) / logos.length;

    fpGeo.features.forEach((f: Feature) => {
        f.properties.id = f.properties.id?.substring(1);

        f.properties.height = props.extrusion[f.properties.type] || props.extrusion.booths;

        if (f.properties.type === featureTypes.booth) {
            let booth = booths.filter((b) => b.name === f.properties.id)[0] as RegularBooth;
            f.properties.color = actualBoothColor(booth);
            f.properties.description = booth.noLabels
                ? null
                : ((booth as RegularBooth)?.exhibitors || [])[0]?.name || booth.title || booth.name;

            const logo = logos.find((l) => l?.name === booth.name);

            if (logo) {
                const scale = avgHeight / logo.htmlImage.height;
                const factor = Math.sqrt(Math.max(1, (logo.bounds.height * logo.bounds.width) / avgArea)) / 5;
                f.properties.scale = scale * factor;

                var exhibitor = (booth as RegularBooth)?.exhibitors?.find((e) => !!e.logo && e.logoInBooth);
                if (exhibitor) f.properties.logo = booth.slug;
            }
        } else {
            let color = f.properties.color;
            f.properties.color = `#${decimalToHex(color.R || color.r || 0)}${decimalToHex(color.G || color.g || 0)}${decimalToHex(
                color.B || color.b || 0
            )}`;
        }
    });

    updateSelectionDataSource([...uiState.selectedBooths], store.boothStore.booths);

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
            const b = allBooths.find((booth) => booth.name === f.properties.id);
            const color = actualBoothColor(b);

            if (selectedBooths.length) {
                f.properties.color = selectedBooths.indexOf(b) === -1 ? Color(color).darken(0.7).hex() : "#f03b55";
            } else {
                f.properties.color = color;
            }
        }
    });

    (map.getSource("data") as GeoJSONSource)?.setData(fpGeo);
}

export function setLayers(layers: Layer[]): string[] {
    const layersNames: string[] = [];

    layers.forEach((layer) => {
        layersNames.push(layer.name + "-other");
        map.addLayer({
            id: layer.name + "-other",
            type: "fill",
            source: "data",
            filter: ["all", ["in", "type", featureTypes.other], ["in", "layer", layer.name], ["!in", "value", "3D"]],
            layout: {
                visibility: layer.visible ? "visible" : "none",
            },
            paint: {
                "fill-color": ["get", "color"],
            },
        });

        layersNames.push(layer.name + "-other-3D");
        map.addLayer({
            id: layer.name + "-other-3D",
            type: "fill-extrusion",
            source: "data",
            filter: ["all", ["in", "type", featureTypes.other], ["in", "layer", layer.name], ["in", "value", "3D"]],
            layout: {
                visibility: layer.visible ? "visible" : "none",
            },
            paint: {
                "fill-extrusion-color": ["get", "color"],
                "fill-extrusion-height": ["get", "height"],
            },
        });
    });

    layers.forEach((layer) => {
        var layerBooths = fpGeo.features.filter(
            (feature) => feature.properties.type === featureTypes.booth && feature.properties.layer === layer.name
        );

        if (layerBooths.length) {
            layersNames.push(layer.name);
            layersNames.push(layer.name + "-labels");

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
                },
            });

            map.addLayer({
                id: layer.name + "-labels",
                type: "symbol",
                source: "data",
                filter: ["all", ["in", "type", featureTypes.booth], ["in", "layer", layer.name]],
                minzoom: 18,

                layout: {
                    "text-field": ["get", "description"],
                    "text-size": ["interpolate", ["linear"], ["zoom"], 18, 8, 19.5, 10, 20, 11, 20.5, 11, 21, 16, 22, 20],
                    "text-optional": true,
                    "text-allow-overlap": false,
                    "text-ignore-placement": false,
                    "icon-image": ["get", "logo"],
                    "icon-anchor": "bottom",
                    "icon-size": ["get", "scale"],
                    "icon-allow-overlap": true,
                    "icon-ignore-placement": true,
                    "icon-rotation-alignment": "viewport",
                    "icon-pitch-alignment": "viewport",
                    visibility: layer.visible ? "visible" : "none",
                },

                paint: {
                    "text-color": settings.boothLabelColor,
                },
            });
        }
    });

    return layersNames;
}

export function setBuildingsLayer(): void {
    map.addLayer({
        id: "buildings",
        type: "fill-extrusion",
        source: "data",
        filter: ["in", "type", featureTypes.building],
        paint: {
            "fill-extrusion-vertical-gradient": true,
            "fill-extrusion-color": ["get", "color"],
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-opacity": ["interpolate", ["linear", 0.5], ["zoom"], 16, 0.9, 19, 0.1],
        },
    });
}

export function setMarker(type: "from" | "to" | "yah" | "cp", point: Point) {
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
        marker = new mapboxgl.Marker(htmlElement, {
            rotationAlignment: type === "cp" || type === "from" ? "map" : "auto",
        }).setLngLat(lngLat);

        marker.addTo(map);
        markersObject[type] = marker;
    }

    marker.setLngLat(lngLat);
}

export function setWayfindingLayer() {
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
        setWayfindingLayer();
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
