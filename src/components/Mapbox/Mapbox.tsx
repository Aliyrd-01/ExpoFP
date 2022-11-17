import classNames from "classnames";
import Color from "color";
import mapboxgl, { Map } from "mapbox-gl";
import { useLocalStore, useObserver } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import * as React from "react";
import Rect from "../../core/Rect";
import { svgArea } from "../../data/svg";
import store, { uiState } from "../../store";
import { Booth, RegularBooth, SpecialBooth } from "../../store/BoothStore";
import settings from "../../tools/settings";
import { bearing, distance } from "../../utils/geolib";
import { useReaction } from "../../utils/mobx";
import MapboxGLButtonControl from "./Button";
import { pulsingDot } from "./Dot";
import "./Mapbox.scss";
import { convertPoint } from "./mapboxUtils";
import { remsToPixels } from "../../utils";

var fpGeo = window["__fpGeo"];

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

    var features =
        data.features.filter((f) => f.properties.type === "viewbox")[0] ||
        data.features.filter((f) => f.properties.type === "venue")[0] ||
        data.features.filter((f) => f.properties.type === "booth");

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

var props = {
    token: "pk.eyJ1Ijoicm9kaW9ubmlrb2xhZXYiLCJhIjoiY2wwanE5aXB4MDM2NTNibGExd3k4bHhsaiJ9.wdpy8dJ1qktQXGtZYDNH3w",
    bearing: getBearing(),
    viewbox: getViewbox(),
    style: getStyle(),
    edgeZoom: 19,
    extrusion: {
        building: 5,
        venue: 1.5,
        other: 1,
    },
};

type Polygon = GeoJSON.FeatureCollection<GeoJSON.Polygon>;

export default function Mapbox() {
    const mapContainer = useRef(null);
    const map = useRef(null);

    useEffect(() => {
        if (map.current) return;

        var data = window["__fpGeo"] as Polygon;

        var { cx: lng, cy: lat } = props.viewbox;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: `mapbox://styles/mapbox/${props.style}`,
            center: [lng, lat],
            zoom: 14,
            bearing: 30,
            pitch: 30,
            maxPitch: 70,
            accessToken: props.token,
        });

        let current: Map = map.current;

        current.addControl(new MapboxGLButtonControl(() => switchViewbox(false), "fa fa-home"), "top-left");

        current.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true,
                },
                trackUserLocation: true,
                showUserHeading: true,
            }),
            "top-left"
        );

        current.addControl(
            new mapboxgl.NavigationControl({
                showCompass: false,
            }),
            "top-left"
        );

        current.addControl(new MapboxGLButtonControl(() => flyToCenter(0, 1000, 0, 45), "fa fa-expand-arrows-alt"), "top-left");

        current.on("load", async () => {
            setTimeout(() => flyToCenter(0, 4000, 0.001, 45), 1000);

            const toHex = (input: string) => {
                var h = parseInt(input).toString(16);
                return h.length == 1 ? "0" + h : h;
            };

            let b = props.viewbox;

            data.features.forEach((f) => {
                f.properties.id = f.properties.id?.substring(1);

                f.properties.height = props.extrusion[f.properties.type] || props.extrusion.other;

                if (f.properties.type === "booth") {
                    let booth = store.boothStore.booths.filter((b) => b.name === f.properties.id)[0];
                    if (booth) f.properties.color = defaultColor(booth);
                } else if (f.properties.color) {
                    let color = f.properties.color;
                    f.properties.color = `#${toHex(color.R || color.r)}${toHex(color.G || color.g)}${toHex(color.B || color.b)}`;

                    if (f.properties.type === "venue") f.properties.color = "grey";
                    else if (f.properties.type === "outline") {
                        let c = Color(f.properties.color);
                        f.properties.color = c.lightness(c.lightness() - 15).hex();
                    }
                }
            });

            current.addSource("booths", {
                type: "geojson",
                data,
            });

            current.addLayer({
                id: "booths",
                type: "fill-extrusion",
                source: "booths",
                filter: ["==", "type", "booth"],
                paint: {
                    "fill-extrusion-color": ["get", "color"],
                    "fill-extrusion-height": ["get", "height"],
                    "fill-extrusion-base": 0,
                    "fill-extrusion-opacity": 1,
                },
            });

            current.addLayer({
                id: "venue",
                type: "fill-extrusion",
                source: "booths",
                filter: ["!in", "type", "booth", "viewbox"],
                paint: {
                    "fill-extrusion-color": ["get", "color"],
                    "fill-extrusion-height": ["get", "height"],
                    "fill-extrusion-base": 0,
                    "fill-extrusion-opacity": 0.3,
                },
            });

            // current.addLayer({
            //     id: "booths",
            //     type: "fill",
            //     source: "booths",
            //     filter: ["==", "type", "booth"],
            //     paint: {
            //         "fill-color": ["get", "color"],
            //         "fill-outline-color": "#FFFFFF"
            //     },
            // });

            // current.addImage("pulsing-dot", pulsingDot(200, current), { pixelRatio: 2 });

            // current.addSource("dot-point", {
            //     type: "geojson",
            //     data: {
            //         type: "FeatureCollection",
            //         features: [
            //             {
            //                 properties: {},
            //                 type: "Feature",
            //                 geometry: {
            //                     type: "Point",
            //                     coordinates: [b.cx, b.cy], // icon position [lng, lat]
            //                 },
            //             },
            //         ],
            //     },
            // });

            // current.addLayer({
            //     id: "layer-with-pulsing-dot",
            //     type: "symbol",
            //     source: "dot-point",
            //     minzoom: 16,
            //     layout: {
            //         "icon-image": "pulsing-dot",
            //     },
            // });

            if (store.routeStore.defaultFrom) {
                var htmlElement = document.createElement("div");
                htmlElement.className = "yahMarker";

                const point = convertPoint(
                    store.routeStore.defaultFrom.rect.cx,
                    store.routeStore.defaultFrom.rect.cy,
                    fpGeo.properties.config
                );

                var yah = new mapboxgl.Marker(htmlElement).setLngLat(point).addTo(current);
            }

            current.on("mouseenter", ["booths"], () => {
                current.getCanvas().style.cursor = "pointer";
            });

            current.on("mouseleave", ["booths"], () => {
                current.getCanvas().style.cursor = "";
            });

            // let prevZoom = 0;
            // current.on("zoom", (e) => {
            //     let zoom = current.getZoom();

            //     if (zoom > prevZoom && zoom > props.edgeZoom && polyIntersected(current.getBounds(), props.viewbox))
            //         switchViewbox(false);

            //     prevZoom = zoom;
            // });

            current.on("click", (e) => {
                const bbox = [
                    [e.point.x - 5, e.point.y - 5],
                    [e.point.x + 5, e.point.y + 5],
                ] as any;

                var props = current.queryRenderedFeatures(bbox, { layers: ["booths", "venue"] })[0]?.properties;
                if (!props) return;

                switchViewbox(false);
            });
        });
    });

    useReaction(
        () => uiState.zoomAfTransformK,
        () => {
            if (uiState.zoomAfTransformK < 0.6) {
                store.selectNone();
                switchViewbox(true);
            }
        }
    );

    useReaction(
        () => store.mapboxStore.mapBoxSelected,
        () => {
            if (store.mapboxStore.mapBoxSelected === null) switchViewbox(true);
        }
    );

    function flyToCenter(bearing: number, duration: number, boundsOffset: number = 0, pitch: number): Promise<void> {
        return new Promise((resolve) => {
            let current: Map = map.current;

            setTimeout(() => resolve(), duration);
            let rect = props.viewbox;

            current.fitBounds(
                [
                    [rect.x1 - boundsOffset, rect.y1 - boundsOffset],
                    [rect.x2 + boundsOffset, rect.y2 + boundsOffset],
                ],
                {
                    bearing,
                    essential: true,
                    duration,
                    pitch: pitch,
                }
            );
        });
    }

    function switchViewbox(mapBoxSelected: boolean) {
        let current: Map = map.current;
        let duration = 1200;

        store.mapboxStore.mapBoxSelected = mapBoxSelected;

        current.scrollZoom.disable();
        current.touchPitch.disable();
        current.touchZoomRotate.disable();

        setTimeout(() => {
            current.scrollZoom.enable();
            current.touchPitch.enable();
            current.touchZoomRotate.enable();
        }, duration);

        if (mapBoxSelected) {
            flyToCenter(0, duration, 0, 45).then(() => {
                uiState.moveToRect = store.layerStore.rectangle || svgArea;
            });
        } else {
            uiState.moveToRect = store.layerStore.rectangle || svgArea;
            flyToCenter(props.bearing, duration, 0, 0).then(() => {
                current.setZoom(props.edgeZoom - 0.5);
            });
        }
    }

    function polyIntersected(bounds: mapboxgl.LngLatBounds, rect: Rect): boolean {
        function contains(a, b) {
            return !(b.x1 < a.x1 || b.y1 < a.y1 || b.x2 > a.x2 || b.y2 > a.y2);
        }

        function overlaps(a, b) {
            // no horizontal overlap
            if (a.x1 >= b.x2 || b.x1 >= a.x2) return false;

            // no vertical overlap
            if (a.y1 >= b.y2 || b.y1 >= a.y2) return false;

            return true;
        }

        function touches(a, b) {
            // has horizontal gap
            if (a.x1 > b.x2 || b.x1 > a.x2) return false;

            // has vertical gap
            if (a.y1 > b.y2 || b.y1 > a.y2) return false;

            return true;
        }

        let arr = bounds.toArray();
        let rect1 = { x1: arr[0][0], y1: arr[0][1], x2: arr[1][0], y2: arr[1][1] };

        let l1 = distance(rect.x1, rect.y1, rect.x2, rect.y2);
        let l2 = distance(rect1.x1, rect1.y1, rect1.x2, rect1.y2);

        return l1 > 1.2 * l2 && (touches(rect1, rect) || overlaps(rect1, rect) || contains(rect1, rect));
    }

    function defaultColor(b: Booth) {
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

    const s = useLocalStore(() => ({
        get style() {
            return {
                left: uiState.overlayPosition !== "left" || uiState.kiosk ? 0 : uiState.mapVisibleLeft + "px",
            };
        },
    }));

    return useObserver(() => {
        return (
            <div>
                <div
                    ref={mapContainer}
                    style={s.style}
                    className={classNames("map-container", {
                        hidden: !store.mapboxStore.showMapbox,
                    })}
                />
            </div>
        );
    });
}
