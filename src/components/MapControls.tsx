import classNames from "classnames";
import React, { useRef, useState } from "react";
import useOnClickOutside from "../utils/useOnClickOutside";
import "./MapControls.scss";

export interface MapControlLayersItem {
    id: string;
    name: string;
}
export interface MapControlsProps {
    className?: string;
    style?: React.CSSProperties;
    title: string;
    titles: string[];
    viewModeSwitch: boolean;
    findLocation: boolean;
    viewMode: boolean;
    layersOpen?: boolean;
    layersList?: MapControlLayersItem[];
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
    title,
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

    const listItems = (items: MapControlLayersItem[]) => {
        return (
            <ul>
                {items.map((item: MapControlLayersItem, index: number) => (
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
        <div className={classNames("map-controls", className)} style={style} role="toolbar" aria-label={title}>
            {findLocation && (
                <button
                    type="button"
                    className="map-control"
                    title={titles[0]}
                    aria-label={titles[0]}
                    onClick={onClickFindLocation}
                >
                    <i className="icon-navigation" aria-hidden="true"></i>
                </button>
            )}
            <button type="button" className="map-control" title={titles[1]} aria-label={titles[1]} onClick={onClickZoomIn}>
                <i className="icon-plus" aria-hidden="true"></i>
            </button>
            <button type="button" className="map-control" title={titles[2]} aria-label={titles[2]} onClick={onClickZoomOut}>
                <i className="icon-minus" aria-hidden="true"></i>
            </button>
            {viewModeSwitch && (
                <button type="button" className="map-control" title={titles[3]} aria-label={titles[3]} onClick={onViewModeSwitch}>
                    {viewMode ? (
                        <i className="icon-two-dim" aria-hidden="true"></i>
                    ) : (
                        <i className="icon-three-dim" aria-hidden="true"></i>
                    )}
                </button>
            )}
            <button type="button" className="map-control" title={titles[4]} aria-label={titles[4]} onClick={onClickByWidth}>
                <i className="icon-maximize" aria-hidden="true"></i>
            </button>

            {layersList ? (
                <div className="layers-button" ref={refLayers}>
                    <button
                        type="button"
                        className={classNames("map-control", {
                            isActive: layersIsOpen,
                        })}
                        title={titles[5]}
                        aria-label={titles[5]}
                        aria-haspopup="true"
                        aria-expanded={layersIsOpen}
                        aria-controls="layers-menu"
                        onClick={() => setLayersOpen(!layersIsOpen)}
                    >
                        <i className="icon-layers" aria-hidden="true"></i>
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
