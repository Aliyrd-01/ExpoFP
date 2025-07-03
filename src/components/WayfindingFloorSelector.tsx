import React from "react";
import cn from "classnames";

import "./WayfindingFloorSelector.scss";

export interface WayfindingFloorSelectorProps {
    floors: { id: number; name: string; description?: string }[];
    current?: { id: number; name: string };
    onClickFloor?: ({ id: number, name: string }) => void;
}

const WayfindingFloorSelector: React.FC<WayfindingFloorSelectorProps> = ({ floors, current, onClickFloor }) => {
    const currentIndex = floors.findIndex((floor) => floor?.id === current?.id);

    return (
        <div className="efp-wayfinding-floor">
            <div className="efp-wayfinding-floor__body">
                <div className="efp-wayfinding-floor__list" role="radiogroup" aria-label="Floor selection">
                    {floors.map((floor, index) => {
                        const isCurrent = floor?.id === current?.id;
                        const isNext = current && index === currentIndex + 1;

                        return (
                            <div
                                key={floor.id}
                                className={cn("efp-wayfinding-floor__item", {
                                    isCurrent,
                                    isNext,
                                })}
                            >
                                <button
                                    type="button"
                                    role="radio"
                                    title={floor.description}
                                    aria-checked={isCurrent}
                                    aria-label={floor.description || `Floor ${floor.name}`}
                                    onClick={() => onClickFloor({ id: floor.id, name: floor.name })}
                                >
                                    <span>{floor.name}</span>
                                </button>
                                {isCurrent && (
                                    <div className="item-walk" aria-hidden="true">
                                        <i className="icon-man-walking-solid" aria-hidden="true"></i>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default WayfindingFloorSelector;
