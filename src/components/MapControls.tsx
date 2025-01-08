import classNames from "classnames";
import React, { useRef, useState } from "react";
import useOnClickOutside from "../utils/useOnClickOutside";
import "./MapControls.scss";

export interface layersListItem {
    id: string;
    name: string;
}
export interface MapControlsProps {
    className?: string;
    style?: React.CSSProperties;
    titles: string[];
    viewModeSwitch: boolean;
    findLocation: boolean;
    viewMode: boolean;
    layersOpen?: boolean;
    layersList?: layersListItem[];
    layersActiveItems?: string[];
    layersWidth?: number;
    onViewModeSwitch: () => void;
    onClickFindLocation: () => void;
    onClickZoomIn: () => void;
    onClickZoomOut: () => void;
    onClickByWidth: () => void;
    onChangeLayers: (value: string) => void;
}

const MapControls: React.FC<MapControlsProps> = ({
    className,
    style,
    titles,
    viewMode,
    viewModeSwitch,
    findLocation,
    layersOpen,
    layersList,
    layersActiveItems,
    layersWidth,
    onViewModeSwitch,
    onClickFindLocation,
    onClickZoomIn,
    onClickZoomOut,
    onClickByWidth,
    onChangeLayers,
}) => {
    const refLayers = useRef(null);
    const [layersIsOpen, setLayersOpen] = useState<boolean>(layersOpen || false);
    useOnClickOutside(refLayers, () => setLayersOpen(false));
    const handleLayersCheck = (id: string) => onChangeLayers(id);

    const listItems = (items: layersListItem[]) => {
        return (
            <ul>
                {items.map((item: layersListItem, index: number) => (
                    <li key={index}>
                        <input
                            type="checkbox"
                            value={item.id}
                            id={item.id}
                            checked={layersActiveItems.includes(item.id) ? true : false}
                            onChange={() => handleLayersCheck(item.id)}
                        />
                        <label htmlFor={item.id}>{item.name}</label>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className={classNames("map-controls", className)} style={style}>
            {findLocation && (
                <button type="button" className="map-control" title={titles[0]} onClick={onClickFindLocation}>
                    <i className="icon-navigation"></i>
                </button>
            )}
            <button type="button" className="map-control" title={titles[1]} onClick={onClickZoomIn}>
                <i className="icon-plus"></i>
            </button>
            <button type="button" className="map-control" title={titles[2]} onClick={onClickZoomOut}>
                <i className="icon-minus"></i>
            </button>
            {viewModeSwitch && (
                <button type="button" className="map-control" title={titles[3]} onClick={onViewModeSwitch}>
                    {viewMode ? <i className="icon-two-dim"></i> : <i className="icon-three-dim"></i>}
                </button>
            )}
            <button type="button" className="map-control" title={titles[4]} onClick={onClickByWidth}>
                <i className="icon-maximize"></i>
            </button>

            {layersList ? (
                <div className="layers-button" ref={refLayers}>
                    <button
                        type="button"
                        className={classNames("map-control", {
                            isActive: layersIsOpen,
                        })}
                        title={titles[5]}
                        onClick={() => setLayersOpen(!layersIsOpen)}
                    >
                        <i className="icon-layers"></i>
                    </button>
                    {layersIsOpen ? (
                        <div className="checked-panel" style={{ minWidth: layersWidth }}>
                            {listItems(layersList)}
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
};

export default MapControls;
