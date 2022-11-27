import classNames from "classnames";
import mapboxgl, { Map } from "mapbox-gl";
import { useLocalStore, useObserver } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import { svgArea } from "../../data/svg";
import store, { boothStore, uiState } from "../../store";
import { useReaction } from "../../utils/mobx";
import "./Mapbox.scss";
import * as React from "react";

import Rect from "../../core/Rect";
import {
    loadLogos,
    moveToRect,
    props,
    setBuildingsLayer,
    setDataSource,
    setLayers,
    setMap,
    setMarker,
    switchViewbox,
    updateHoverDataSource,
    updateRouteLines,
    updateSelectionDataSource,
} from "./utils/data";
import { CurrentPosition } from "../../store/RouteStore";

export default function Mapbox() {
    const mapContainer = useRef(null);
    const map = useRef<Map>(null);
    let hoverTimeout = null;

    const ls = useLocalStore(() => ({
        get initselected() {
            return ![...uiState.selectedBooths].filter((b) => b.rect);
        },

        get actualCurrentPosition(): CurrentPosition {
            const cp = store.routeStore.currentPosition;

            return !cp?.z || store.layerStore.visible.indexOf(store.layerStore.layers.find((l) => l.name === cp.z)) > -1
                ? cp
                : null;
        },

        get style() {
            return {
                left: uiState.overlayPosition !== "left" || uiState.kiosk ? 0 : uiState.mapVisibleLeft + "px",
            };
        },
    }));

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
            setTimeout(
                () =>
                    moveToRect(
                        ls.initselected
                            ? Rect.fromMultiple([...uiState.selectedBooths].filter((b) => b.rect).map((b) => b.rect))
                            : svgArea,
                        15,
                        4000
                    ),
                1500
            );

            await loadLogos();

            setDataSource(store.boothStore.booths);
            setMarker(
                "yah",
                store.routeStore.defaultFrom?.rect
                    ? { x: store.routeStore.defaultFrom.rect.cx, y: store.routeStore.defaultFrom.rect.cy }
                    : null
            );

            const boothsLayers = setLayers(store.layerStore.layers).filter((l) => l.indexOf("-other") == -1);

            setBuildingsLayer();

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

    // Update layers visibility, loading, selected route
    useReaction(
        () => [store.layerStore.loaded, store.layerStore.visible, uiState.selectedRoute],
        () => {
            store.layerStore.layers.forEach((layer) => {
                var exists = map.current.getLayer(layer.name);

                if (exists) {
                    if (layer.visible ? "visible" : "none" !== map.current.getLayoutProperty(layer.name, "visibility")) {
                        ["", "-labels", "-other"].forEach((suffix) =>
                            map.current.setLayoutProperty(layer.name + suffix, "visibility", layer.visible ? "visible" : "none")
                        );
                    }
                }
            });

            updateSelectionDataSource([...uiState.selectedBooths], store.boothStore.booths);

            // Update YAH marker visibility
            setMarker(
                "yah",
                store.routeStore.defaultFrom?.rect && store.routeStore.defaultFrom?.layer?.visible
                    ? { x: store.routeStore.defaultFrom.rect.cx, y: store.routeStore.defaultFrom.rect.cy }
                    : null
            );

            setMarker("cp", ls.actualCurrentPosition);
        }
    );

    // Hover booths
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

    // Move to booths
    useReaction(
        () => uiState.moveToBooths,
        () => {
            if (!uiState.moveToBooths || !store.mapboxStore.showMapbox) return;

            const rects = uiState.moveToBooths.filter((b) => b.rect).map((b) => b.rect);
            const rect = Rect.fromMultiple(rects);
            if (rects.length) moveToRect(rect);
            uiState.moveToBooths = null;
        }
    );

    // Move to rect
    useReaction(
        () => uiState.moveToRect,
        () => {
            if (!uiState.moveToRect || !store.mapboxStore.showMapbox) return;
            moveToRect(uiState.moveToRect, 15);
            uiState.moveToRect = null;
        }
    );

    // Move to center
    useReaction(
        () => uiState.centerMap,
        () => {
            if (!uiState.centerMap || !store.mapboxStore.showMapbox) return;
            moveToRect(Rect.fromMultiple(boothStore.booths.map((b) => b.rect)), 15);
            uiState.centerMap = false;
        }
    );

    // Route lines
    useReaction(
        () => store.routeStore.routeLines,
        () => updateRouteLines(store.routeStore)
    );

    // Current position
    useReaction(
        () => ls.actualCurrentPosition,
        () => setMarker("cp", ls.actualCurrentPosition)
    );

    return useObserver(() => {
        return (
            <div
                ref={mapContainer}
                style={ls.style}
                className={classNames("map-container", {
                    hidden: !store.mapboxStore.showMapbox,
                })}
            />
        );
    });
}
