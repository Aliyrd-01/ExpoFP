import classNames from "classnames";
import React, { useRef, useState } from "react";
import useOnClickOutside from "../utils/useOnClickOutside";
import "./MapControls.scss";

export interface layersListItem {
    id: string;
    name: string;
}
export interface MapControlsProps {
    titles: string[];
    layersOpen?: boolean;
    layersList?: layersListItem[];
    layersActiveItems?: string[];
    onClickZoomIn: () => void;
    onClickZoomOut: () => void;
    onClickByWidth: () => void;
    onChangeLayers: (value: string) => void;
}

const MapControls: React.FC<MapControlsProps> = ({
    titles,
    layersOpen,
    layersList,
    layersActiveItems,
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
        <div className="mapControls">
            <button type="button" className="mapControl" title={titles[0]} onClick={onClickZoomIn}>
                <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M10.9999 3.83337C11.4141 3.83337 11.7499 4.16916 11.7499 4.58337V10.25H17.4166C17.8308 10.25 18.1666 10.5858 18.1666 11C18.1666 11.4143 17.8308 11.75 17.4166 11.75H11.7499V17.4167C11.7499 17.8309 11.4141 18.1667 10.9999 18.1667C10.5857 18.1667 10.2499 17.8309 10.2499 17.4167V11.75H4.58325C4.16904 11.75 3.83325 11.4143 3.83325 11C3.83325 10.5858 4.16904 10.25 4.58325 10.25H10.2499V4.58337C10.2499 4.16916 10.5857 3.83337 10.9999 3.83337Z"
                    />
                </svg>
            </button>
            <button type="button" className="mapControl" title={titles[1]} onClick={onClickZoomOut}>
                <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M2.91675 11C2.91675 10.5858 3.25253 10.25 3.66675 10.25H18.3334C18.7476 10.25 19.0834 10.5858 19.0834 11C19.0834 11.4142 18.7476 11.75 18.3334 11.75H3.66675C3.25253 11.75 2.91675 11.4142 2.91675 11Z"
                    />
                </svg>
            </button>
            <button type="button" className="mapControl" title={titles[2]} onClick={onClickByWidth}>
                <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M13.9167 3.66675C13.9167 3.25253 14.2525 2.91675 14.6667 2.91675H18.3334C18.7476 2.91675 19.0834 3.25253 19.0834 3.66675V7.33342C19.0834 7.74763 18.7476 8.08342 18.3334 8.08342C17.9192 8.08342 17.5834 7.74763 17.5834 7.33342V4.41675H14.6667C14.2525 4.41675 13.9167 4.08096 13.9167 3.66675Z"
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M18.8636 3.13642C19.1565 3.42931 19.1565 3.90418 18.8636 4.19708L13.3636 9.69708C13.0707 9.98997 12.5958 9.98997 12.3029 9.69708C12.01 9.40418 12.01 8.92931 12.3029 8.63642L17.8029 3.13642C18.0958 2.84352 18.5707 2.84352 18.8636 3.13642Z"
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M3.66675 13.9167C4.08096 13.9167 4.41675 14.2525 4.41675 14.6667V17.5834H7.33342C7.74763 17.5834 8.08342 17.9192 8.08342 18.3334C8.08342 18.7476 7.74763 19.0834 7.33342 19.0834H3.66675C3.25253 19.0834 2.91675 18.7476 2.91675 18.3334V14.6667C2.91675 14.2525 3.25253 13.9167 3.66675 13.9167Z"
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M9.69708 12.3029C9.98997 12.5958 9.98997 13.0707 9.69708 13.3636L4.19708 18.8636C3.90418 19.1565 3.42931 19.1565 3.13642 18.8636C2.84352 18.5707 2.84352 18.0958 3.13642 17.8029L8.63642 12.3029C8.92931 12.01 9.40418 12.01 9.69708 12.3029Z"
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M18.3334 13.9167C18.7476 13.9167 19.0834 14.2525 19.0834 14.6667V18.3334C19.0834 18.7476 18.7476 19.0834 18.3334 19.0834H14.6667C14.2525 19.0834 13.9167 18.7476 13.9167 18.3334C13.9167 17.9192 14.2525 17.5834 14.6667 17.5834H17.5834V14.6667C17.5834 14.2525 17.9192 13.9167 18.3334 13.9167Z"
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12.3029 12.3029C12.5958 12.01 13.0707 12.01 13.3636 12.3029L18.8636 17.8029C19.1565 18.0958 19.1565 18.5707 18.8636 18.8636C18.5707 19.1565 18.0958 19.1565 17.8029 18.8636L12.3029 13.3636C12.01 13.0707 12.01 12.5958 12.3029 12.3029Z"
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M2.91675 3.66675C2.91675 3.25253 3.25253 2.91675 3.66675 2.91675H7.33342C7.74763 2.91675 8.08342 3.25253 8.08342 3.66675C8.08342 4.08096 7.74763 4.41675 7.33342 4.41675H4.41675V7.33342C4.41675 7.74763 4.08096 8.08342 3.66675 8.08342C3.25253 8.08342 2.91675 7.74763 2.91675 7.33342V3.66675Z"
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M3.13642 3.13642C3.42931 2.84352 3.90418 2.84352 4.19708 3.13642L9.69708 8.63642C9.98997 8.92931 9.98997 9.40418 9.69708 9.69708C9.40418 9.98997 8.92931 9.98997 8.63642 9.69708L3.13642 4.19708C2.84352 3.90418 2.84352 3.42931 3.13642 3.13642Z"
                    />
                </svg>
            </button>
            {layersList ? (
                <div className="layersButton" ref={refLayers}>
                    <button
                        type="button"
                        className={classNames("mapControl", {
                            isActive: layersIsOpen,
                        })}
                        title={titles[3]}
                        onClick={() => setLayersOpen(!layersIsOpen)}
                    >
                        <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M10.6646 1.16251C10.8757 1.05694 11.1242 1.05694 11.3354 1.16251L20.502 5.74584C20.7561 5.87288 20.9166 6.13258 20.9166 6.41666C20.9166 6.70074 20.7561 6.96044 20.502 7.08748L11.3354 11.6708C11.1242 11.7764 10.8757 11.7764 10.6646 11.6708L1.49788 7.08748C1.2438 6.96044 1.08329 6.70074 1.08329 6.41666C1.08329 6.13258 1.2438 5.87288 1.49788 5.74584L10.6646 1.16251ZM3.51035 6.41666L11 10.1615L18.4896 6.41666L11 2.67185L3.51035 6.41666Z"
                            />
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M1.16247 15.2479C1.34772 14.8774 1.79822 14.7273 2.1687 14.9125L11 19.3281L19.8312 14.9125C20.2017 14.7273 20.6522 14.8774 20.8374 15.2479C21.0227 15.6184 20.8725 16.0689 20.502 16.2541L11.3354 20.8375C11.1242 20.9431 10.8757 20.9431 10.6646 20.8375L1.49788 16.2541C1.1274 16.0689 0.977232 15.6184 1.16247 15.2479Z"
                            />
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M1.16247 10.6646C1.34772 10.2941 1.79822 10.1439 2.1687 10.3292L11 14.7448L19.8312 10.3292C20.2017 10.1439 20.6522 10.2941 20.8374 10.6646C21.0227 11.0351 20.8725 11.4856 20.502 11.6708L11.3354 16.2541C11.1242 16.3597 10.8757 16.3597 10.6646 16.2541L1.49788 11.6708C1.1274 11.4856 0.977232 11.0351 1.16247 10.6646Z"
                            />
                        </svg>
                    </button>
                    {layersIsOpen ? <div className="checkedPanel">{listItems(layersList)}</div> : null}
                </div>
            ) : null}
        </div>
    );
};

export default MapControls;
