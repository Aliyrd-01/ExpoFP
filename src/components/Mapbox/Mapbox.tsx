import classNames from "classnames";
import mapboxgl, { Map } from "mapbox-gl";
import { useLocalStore, useObserver } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import { svgArea } from "../../data/svg";
import store, { boothStore, uiState } from "../../store";
import { useReaction } from "../../utils/mobx";
import "./Mapbox.scss";
import * as React from "react";

import {
    props,
    setBoothsLayers,
    setDataSource,
    setMarker,
    setVenuesLayer,
    updateSelectionDataSource,
    updateRouteLines,
    updateHoverDataSource,
    setOthersLayer,
    setBoothsLabelsLayers,
    moveToRect,
    setMap,
    loadLogos,
} from "./utils/data";
import Rect from "../../core/Rect";

export default function Mapbox() {
    const mapContainer = useRef(null);
    let map = useRef<Map>(null);

    useEffect(() => {
        if (map.current) return;

        var { cx: lng, cy: lat } = props.viewbox;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: `mapbox://styles/mapbox/${props.style}`,
            center: [lng, lat],
            zoom: 15.5,
            bearing: props.initBearing - 30,
            pitch: props.initPitch + 30,
            maxPitch: 70,
            bearingSnap: 0,
            accessToken: props.token,
        });

        setMap(map.current);

        map.current.on("load", async () => {
            setTimeout(() => flyToCenter(props.initBearing, 4000, 0, props.initPitch), 1000);

            await loadLogos();

            setDataSource(store.boothStore.booths);
            setMarker(
                "yah",
                store.routeStore.defaultFrom
                    ? { x: store.routeStore.defaultFrom.rect.cx, y: store.routeStore.defaultFrom.rect.cy }
                    : null
            );

            const boothsLayers = setBoothsLayers(store.layerStore.layers);
            setBoothsLabelsLayers(store.layerStore.layers);
            setOthersLayer(map.current);
            setVenuesLayer(map.current);

            map.current.on("mouseenter", boothsLayers, () => (map.current.getCanvas().style.cursor = "pointer"));

            map.current.on("mouseleave", boothsLayers, () => (map.current.getCanvas().style.cursor = ""));

            map.current.on("click", (e) => {
                const bbox = [
                    [e.point.x - 5, e.point.y - 5],
                    [e.point.x + 5, e.point.y + 5],
                ] as any;

                const selectedFeature = map.current.queryRenderedFeatures(bbox, {
                    layers: boothsLayers,
                })[0];

                const booth = store.boothStore.booths.find((b) => b.name === selectedFeature?.properties?.id);
                store.clickBooth(booth);
            });
        });
    });

    // ZoomBy
    useReaction(
        () => uiState.zoomBy,
        () => {
            if (!uiState.zoomBy || !store.mapboxStore.showMapbox) return;
            const z = uiState.zoomBy;
            uiState.zoomBy = null;
            map.current.flyTo({
                zoom: map.current.getZoom() + (z > 1 ? 0.5 : -0.5),
                animate: true,
                duration: 500,
                essential: true,
            });
        }
    );

    //Layer visible
    useReaction(
        () => store.layerStore.visible,
        () => {
            // Update layers visibility
            store.layerStore.layers.forEach((layer) => {
                var exists = map.current.getLayer(layer.name);

                if (exists) {
                    if (
                        exists && layer.visible ? "visible" : "none" !== map.current.getLayoutProperty(layer.name, "visibility")
                    ) {
                        map.current.setLayoutProperty(layer.name, "visibility", layer.visible ? "visible" : "none");
                    }
                }
            });

            // Update YAH marker visibility
            setMarker(
                "yah",
                store.routeStore.defaultFrom
                    ? { x: store.routeStore.defaultFrom.rect.cx, y: store.routeStore.defaultFrom.rect.cy }
                    : null
            );
        }
    );

    // Hover
    let hoverTimeout = null;
    useReaction(
        () => uiState.hoveredBooths,
        () => {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
                hoverTimeout = null;
            }

            hoverTimeout = setTimeout(() => {
                hoverTimeout = null;
                updateHoverDataSource(
                    [...uiState.hoveredBooths].filter((b) => b.layer?.visible ?? true),
                    store.boothStore.booths
                );
            }, 50);
        }
    );

    // Selection & listed
    useReaction(
        () => [uiState.selectedBooths, uiState.listBooths],
        () => {
            var selected = [];
            if (uiState.selectedBooths.size) selected = [...uiState.selectedBooths];
            else if (
                uiState.listBooths.size &&
                (uiState.activeListIndex === 0 || uiState.list.type === "bookmarks" || uiState.list.type === "category")
            ) {
                selected = [...uiState.listBooths];
            }

            updateSelectionDataSource(selected, store.boothStore.booths);
        }
    );

    // View switching
    useReaction(
        () => store.mapboxStore.showMapbox,
        () => switchViewbox(store.mapboxStore.showMapbox)
    );

    // Move to boothsa
    useReaction(
        () => uiState.moveToBooths,
        () => {
            if (!uiState.moveToBooths || !store.mapboxStore.showMapbox) return;
            moveToRect(Rect.fromMultiple(uiState.moveToBooths.map((b) => b.rect)));
            uiState.moveToBooths = null;
        }
    );

    // Move to rect
    useReaction(
        () => uiState.moveToRect,
        () => {
            if (!uiState.moveToRect || !store.mapboxStore.showMapbox) return;
            moveToRect(uiState.moveToRect);
            uiState.moveToRect = null;
        }
    );

    // Move to center
    useReaction(
        () => uiState.centerMap,
        () => {
            if (!uiState.centerMap || !store.mapboxStore.showMapbox) return;
            moveToRect(Rect.fromMultiple(boothStore.booths.map((b) => b.rect)));
            uiState.centerMap = false;
        }
    );

    // Routing
    useReaction(
        () => store.routeStore.routeLines,
        () => updateRouteLines(store.routeStore)
    );

    function flyToCenter(bearing: number, duration: number, boundsOffset: number = 0, pitch: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(), duration);
            let rect = props.viewbox;

            map.current.fitBounds(
                [
                    [rect.x1 - boundsOffset, rect.y1 - boundsOffset],
                    [rect.x2 + boundsOffset, rect.y2 + boundsOffset],
                ],
                {
                    bearing,
                    essential: true,
                    duration,
                    pitch,
                }
            );
        });
    }

    function switchViewbox(showMapbox: boolean) {
        let duration = 1200;

        store.mapboxStore.mapBoxSelected = showMapbox;

        map.current.scrollZoom.disable();
        map.current.touchPitch.disable();
        map.current.touchZoomRotate.disable();

        setTimeout(() => {
            map.current.scrollZoom.enable();
            map.current.touchPitch.enable();
            map.current.touchZoomRotate.enable();
        }, duration);

        if (showMapbox) {
            flyToCenter(props.initBearing, duration, 0, props.initPitch).then(() => {
                //uiState.moveToRect = store.layerStore.rectangle || svgArea;
            });
        } else {
            uiState.moveToRect = store.layerStore.rectangle || svgArea;
            flyToCenter(props.bearing, duration, 0, 0).then(() => {
                map.current.setZoom(props.edgeZoom - 0.5);
            });
        }
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
            <div
                ref={mapContainer}
                style={s.style}
                className={classNames("map-container", {
                    hidden: !store.mapboxStore.showMapbox,
                })}
            />
        );
    });
}
