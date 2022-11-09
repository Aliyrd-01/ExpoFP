export default class MapboxGLButtonControl {
    _click;
    _map;
    _container;
    _className;

    public constructor(onClick: () => void, className: string) {
        this._click = onClick;
        this._className = className;
    }

    public onAdd(map) {
        this._map = map;

        var container = document.createElement("div") as HTMLDivElement;
        var button = document.createElement("button");
        container.appendChild(button);

        container.className = "mapboxgl-ctrl controls -ready";

        button.className = this._className;
        container.onclick = this._click;

        this._container = container;
        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}
