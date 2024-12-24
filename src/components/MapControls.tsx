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
                    <i className="icon-navitagtion"></i>
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
                    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        {viewMode ? (
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M2.10288 18V16.6359L5.91721 12.5946C6.67282 11.8003 7.15176 11.2631 7.44256 10.8108C7.72935 10.3647 7.8311 10.0044 7.8311 9.56063V9.53671C7.8311 9.00015 7.6486 8.54089 7.32378 8.21595C6.99911 7.89116 6.52411 7.69247 5.92422 7.69247C5.30815 7.69247 4.80335 7.89541 4.45306 8.24135C4.10298 8.5871 3.89883 9.08394 3.89883 9.68818V9.70584L3.86081 9.82094H2.07916L2 9.74106L2.00017 9.69574C2.00423 8.61406 2.42116 7.6878 3.13467 7.03278C3.8475 6.37839 4.85031 6 6.01903 6C8.18965 6 9.81667 7.3984 9.81667 9.36931V9.39322C9.81667 10.7493 9.1845 11.7821 7.11436 13.8549L4.72843 16.2543V16.2597H9.99839V18H2.10288ZM12.3031 18V6.27901H16.5274C18.2408 6.27901 19.6129 6.81278 20.5561 7.81665C21.4986 8.81974 22 10.2785 22 12.1036V12.1196C22 13.9641 21.5029 15.4368 20.5625 16.449C19.6212 17.4621 18.2488 18 16.5274 18H12.3031ZM14.2886 16.2438H16.3298C17.499 16.2438 18.4075 15.8676 19.0249 15.1766C19.6438 14.484 19.9828 13.461 19.9828 12.1435V12.1275C19.9828 10.8227 19.6382 9.80142 19.0162 9.1075C18.3954 8.41504 17.4866 8.03525 16.3298 8.03525H14.2886V16.2438Z"
                            />
                        ) : (
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M7.94024 11.7289C8.59113 11.8549 9.14478 12.1275 9.55688 12.5317C10.0578 13.0229 10.342 13.7011 10.342 14.5231V14.5389C10.342 16.57 8.59841 18 6.19873 18C4.99083 18 3.98398 17.662 3.25837 17.0764C2.53179 16.49 2.09291 15.6596 2.01722 14.6893L2 14.4786H3.86215L3.87929 14.6534C3.97984 15.6109 4.84974 16.3129 6.19873 16.3129C6.85902 16.3129 7.4032 16.1236 7.78016 15.8079C8.15558 15.4935 8.37088 15.0495 8.37088 14.5231V14.5074C8.37088 13.8941 8.15451 13.4266 7.76933 13.1101C7.381 12.7909 6.80902 12.6153 6.08292 12.6153H4.61869V11.0305H6.02888C6.64559 11.0305 7.1548 10.8457 7.50793 10.5421C7.85991 10.2395 8.06205 9.81478 8.06205 9.31944V9.30369C8.06205 8.77805 7.88995 8.37304 7.57828 8.0978C7.2645 7.82068 6.79605 7.6635 6.18329 7.6635C5.58379 7.6635 5.08281 7.82583 4.7208 8.10963C4.3602 8.39233 4.13125 8.80015 4.08008 9.3067L4.06289 9.48203H2.23075L2.24892 9.27826C2.33627 8.29453 2.7621 7.47242 3.44894 6.89728C4.13496 6.32282 5.07478 6 6.18329 6C7.30919 6 8.25103 6.30801 8.91373 6.84921C9.5783 7.39194 9.95595 8.16466 9.95595 9.07539V9.09114C9.95595 10.4141 9.11967 11.3378 7.94024 11.7289ZM12.5245 17.7874V6.21256H16.6523C18.3266 6.21256 19.6674 6.73967 20.5891 7.73103C21.5101 8.72161 22 10.1622 22 11.9646V11.9803C22 13.8019 21.5142 15.2561 20.5953 16.2557C19.6755 17.2563 18.3345 17.7874 16.6523 17.7874H12.5245ZM14.4648 16.0531H16.4593C17.6018 16.0531 18.4896 15.6816 19.0929 14.9993C19.6976 14.3153 20.0289 13.305 20.0289 12.0039V11.9882C20.0289 10.6996 19.6921 9.69106 19.0843 9.00579C18.4778 8.32196 17.5897 7.9469 16.4593 7.9469H14.4648V16.0531Z"
                            />
                        )}
                    </svg>
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
