// @ts-nocheck
import mapboxgl from "mapbox-gl";

// This is needed for mapbox to use webgl2
export function configureWebGLForMapbox() {
    if (mapboxgl.Map.prototype._setupPainter.toString().indexOf("webgl2") > -1) {
        const _setupPainter_old = mapboxgl.Map.prototype._setupPainter;
        mapboxgl.Map.prototype._setupPainter = function() {
            const getContext_old = this._canvas.getContext;
            this._canvas.getContext = function(name, attrib) {
                return 	getContext_old.apply(this, ["webgl2", attrib]) ||
                    getContext_old.apply(this, ['webgl', attrib]) ||
                    getContext_old.apply(this, ['experimental-webgl', attrib]);
            }
            _setupPainter_old.apply(this);
            this._canvas.getContext = getContext_old;
        };
    }
}