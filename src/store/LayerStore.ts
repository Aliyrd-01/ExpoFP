// import { observable } from 'mobx';
import { interpolateNumber } from "d3";
import { easeLinear } from "d3-ease";
import { action, computed, observable } from "mobx";
import store from ".";
import animate from "../components/Map/drawing/config/animate";
import loadLayer from "../components/Map/drawing/config/config-load-layer";
import { DrawerContext } from "../components/Map/drawing/Drawer1";
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
    child: boolean = false;
    childLayers: Layer[] = [];
    parent: Layer;
    mode: LayerMode;

    @observable loaded: boolean;
    @observable visible: boolean;

    get shortName(): string {
        const parts = this.description.replace(/"/g, "").split(" ");
        if (parts.length === 1) return this.description.substring(0, 2).toUpperCase();

        var name: string;
        if (Number.isInteger(parseInt(parts[0]))) {
            name = parts[0] + parts[1][0];
        } else if (Number.isInteger(parseInt(parts[1]))) {
            name = parts[0][0] + parts[1];
        } else name = parts[0][0] + parts[1][0];

        return name.toLocaleUpperCase();
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

    @action updateVisibility(layerOrName: string | Layer, visible: boolean, animated: boolean = false): void {
        if (this.mode === LayersMode.Radio && !visible) return;

        const layer = layerOrName instanceof Layer ? layerOrName : this.findLayer(layerOrName);
        if (!layer || layer.visible === visible) return;

        loadLayer(layer).then(() => {
            if (this.mode === LayersMode.Radio) {
                this.layers.forEach((l) => {
                    if (l.name !== layer.name && !l.frozen && l.visible) {
                        if (!animated) {
                            l.visible = false;
                            l.childLayers.forEach(child => {
                                child.visible = false;
                            })
                        }
                        else {
                            an(l, false);
                        }
                    }
                    //else if (l.rect) uiState.moveToRect = l.rect;
                });
            }

            if (layer) {
                if (!animated) {
                    layer.visible = visible;
                    layer.childLayers.forEach(child => {
                        child.visible = visible;
                    });
                }
                else {
                    an(layer, visible);
                    layer.childLayers.forEach(child => {
                        if (!animated) {
                            child.visible = visible;
                        } else {
                            an(child, visible);
                        }
                    });
                }
            }
        });
    }

    public findLayer(z: string | number): Layer {
        if (!z) return null;
        z = z.toString().toLowerCase();

        return this.layers.find((l) => {
            const extractedNumber = (l.name.match(/(-?[0-9]+)/) || "")[0];

            return (
                z === l?.name.toLowerCase() ||
                z === l?.description.toLowerCase() ||
                z === l?.shortName.toLowerCase() ||
                z === extractedNumber
            );
        });
    }
}

let _context: DrawerContext;
export function setContext(context: DrawerContext) {
    _context = context;
}

function an(layer: Layer, toVisible: boolean): void {
    if (toVisible) store.layerStore.updateVisibility(layer, true);

    animate(
        0,
        250,
        easeLinear,
        toVisible ? interpolateNumber(0, 1) : interpolateNumber(1, 0),
        _context.requireUpdate.bind(_context),
        (v) => {
            layer.visible = toVisible;
            _context.getLayersPainters([layer.name]).forEach((p) => ((p as RectPainter).alpha = v))
        },
        () => {
            layer.visible = toVisible;
            if (!toVisible) {
                layer.visible = false;
                _context.getLayersPainters([layer.name]).forEach((p) => ((p as RectPainter).alpha = 1));
            }
        }
    );
}
