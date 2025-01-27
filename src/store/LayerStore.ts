// import { observable } from 'mobx';
import { interpolateNumber } from "d3";
import { easeLinear } from "d3-ease";
import { action, computed, observable } from "mobx";
import store from ".";
import { DrawerContext } from "../components/Map/drawing/Drawer1";
import animate from "../components/Map/drawing/config/animate";
import loadLayer from "../components/Map/drawing/config/config-load-layer";
import RectPainter from "../components/Map/drawing/painters/RectPainter";

import Rect from "../core/Rect";

export enum LayersMode {
    Default,
    Separated,
    Radio,
    CheckBox,
}

export enum LayerMode {
    Unset = 0,
    AlwaysVisible = 1,
    AlwaysHidden = 2,
    TurnedOn = 3,
    TurnedOff = 4,
}

export class Layer {
    basePriority: number;
    name: string;
    description: string;
    frozen: boolean;
    rect: Rect = null;
    configured: boolean;
    childLayers: Layer[] = [];
    rootParent: Layer = null;
    mode: LayerMode;

    @observable loaded: boolean;
    @observable visible: boolean;

    get shortName(): string {
        return this.description
            .split(" ")
            .map((x) => x.replace(/[^A-Z0-9]/gi, ""))
            .map((x) => x.substring(0, 1).toLocaleUpperCase())
            .join("");
    }
}

export default class LayerStore {
    @observable layers: Layer[] = [];
    @observable defaultLayer: Layer;
    @observable mode: LayersMode;
    @observable layersLoaded: boolean = false;

    @computed({ keepAlive: true }) get visible() {
        return this.layers.filter((l) => l.frozen || l.visible);
    }

    @computed({ keepAlive: true }) get loaded() {
        return this.layers.filter((l) => l.loaded);
    }

    @computed({ keepAlive: true }) get rectangle() {
        var l = this.visible.filter((l) => !l.frozen).map((l) => l.rect);
        return this.mode !== LayersMode.Radio || !l.length ? null : Rect.fromMultiple(l) || null;
    }

    @computed get floors() {
        const uniqueLayers = new Set(
            this.layers
                .filter((l) => !l.frozen && !l.rootParent)
                .concat(
                    store.routeStore.layers.filter(
                        (l) => l.mode !== LayerMode.AlwaysHidden && l.mode !== LayerMode.AlwaysVisible,
                    ),
                ),
        );

        return Array.from(uniqueLayers)
            .reverse()
            .map((l) => ({
                layer: l,
                name: l.name,
                shortName: l.shortName,
                description: l.description,
                active: l.visible,
                disabled: store.routeStore.layers.length && store.routeStore.layers.indexOf(l) === -1,
            }));
    }

    @action updateVisibility(layerOrName: string | Layer, visible: boolean, animated: boolean = false): void {
        if (this.mode === LayersMode.Radio && !visible) return;

        const layer = layerOrName instanceof Layer ? layerOrName : this.findLayer(layerOrName);
        if (!layer || layer.visible === visible) {
            if (layer && store.routeStore.currentRouteLayer !== layer) {
                store.routeStore.currentRouteLayer = layer;
            }
            return;
        }

        loadLayer(layer).then(() => {
            if (this.mode === LayersMode.Radio) {
                this.layers.forEach((l) => {
                    if (l.name !== layer.name && !l.frozen && l.visible) {
                        if (!animated) {
                            l.visible = false;
                            l.childLayers.forEach((child) => {
                                child.visible = false;
                            });
                        } else {
                            an(l, false);
                        }
                    }
                });
            }

            if (layer) {
                if (!animated) {
                    layer.visible = visible;
                    layer.childLayers.forEach((child) => {
                        child.visible = visible;
                    });

                    if (visible) store.routeStore.currentRouteLayer = layer;
                } else {
                    an(layer, visible, () => {
                        if (visible) store.routeStore.currentRouteLayer = layer;
                    });
                }
            }
        });
    }

    public findLayer(z: string | number): Layer {
        if (z === null || z === undefined) return null;

        const layers = this.layers.filter((l) => !l.rootParent);

        if (typeof z === "number") {
            l = layers.filter((k) => !k.frozen)[z];
            if (l) return l;
        }

        z = z.toString().toLowerCase();

        var l = layers.find((l) => {
            const extractedNumber = (l.name.match(/(-?[0-9]+)/) || "")[0];

            return (
                z === l?.name.toLowerCase() ||
                z === l?.description.toLowerCase() ||
                z === l?.shortName.toLowerCase() ||
                z === extractedNumber
            );
        });

        if (!l && !/\D/.test(z)) {
            l = layers.filter((k) => !k.frozen)[parseInt(z)];
        }

        return l;
    }
}

let _context: DrawerContext;
export function setContext(context: DrawerContext) {
    _context = context;
}

function an(layer: Layer, toVisible: boolean, callback: () => void = null): void {
    if (toVisible) store.layerStore.updateVisibility(layer, true);

    animate(
        0,
        250,
        easeLinear,
        toVisible ? interpolateNumber(0, 1) : interpolateNumber(1, 0),
        _context.requireUpdate.bind(_context),
        (v) => {
            layer.visible = toVisible;
            layer.childLayers.forEach((l) => (l.visible = toVisible));
            const layersPainters = _context.getLayersPainters([layer.name, ...layer.childLayers.map((l) => l.name)]);
            layersPainters.forEach((p) => ((p as RectPainter).alpha = v));
        },
        () => {
            layer.visible = toVisible;
            layer.childLayers.forEach((l) => (l.visible = toVisible));
            if (!toVisible) {
                const layersPainters = _context.getLayersPainters([layer.name, ...layer.childLayers.map((l) => l.name)]);
                layersPainters.forEach((p) => ((p as RectPainter).alpha = 1));
            }

            callback?.();
        }
    );
}
