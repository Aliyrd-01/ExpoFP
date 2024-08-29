import React, { useState } from "react";
import cn from "classnames";
import "./WayfindingFloorSelector.scss";

export interface WayfindingFloorSelectorProps {
    floors: { id: number; name: string }[];
    current?: { id: number; name: string };
    onClickFloor?: ({ id: number, name: string }) => void;
}

const WayfindingFloorSelector: React.FC<WayfindingFloorSelectorProps> = ({ floors, current, onClickFloor }) => {
    const [selectedFloorIndex, setSelectedFloorIndex] = useState(null);

    const handleClickFloor = (floor, index) => {
        onClickFloor({ id: floor.id, name: floor.name });
        setSelectedFloorIndex(index);
    };

    return (
        <div className="efp-wayfinding-floor">
            <div className="efp-wayfinding-floor__body">
                <div className="efp-wayfinding-floor__list">
                    {floors.map((floor, index) => (
                        <button
                            type="button"
                            className={cn({
                                isCurrent: floor?.id === current?.id,
                                greyedOut: selectedFloorIndex !== null && index < selectedFloorIndex,
                            })}
                            onClick={() => handleClickFloor(floor, index)}
                            key={index}
                        >
                            <span>{floor.name}</span>
                            {floor?.id === current?.id && index !== floors.length - 1 && (
                                <div className="line-arrows">
                                    <svg width="34" height="19" viewBox="0 0 34 19" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M1.11612 1.11612C1.60427 0.627961 2.39573 0.627961 2.88388 1.11612L10.3839 8.61612C10.872 9.10427 10.872 9.89573 10.3839 10.3839L2.88388 17.8839C2.39573 18.372 1.60427 18.372 1.11612 17.8839C0.627961 17.3957 0.627961 16.6043 1.11612 16.1161L7.73223 9.5L1.11612 2.88388C0.627961 2.39573 0.627961 1.60427 1.11612 1.11612Z"
                                        />
                                        <path
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M12.3661 1.11612C12.8543 0.627961 13.6457 0.627961 14.1339 1.11612L21.6339 8.61612C22.122 9.10427 22.122 9.89573 21.6339 10.3839L14.1339 17.8839C13.6457 18.372 12.8543 18.372 12.3661 17.8839C11.878 17.3957 11.878 16.6043 12.3661 16.1161L18.9822 9.5L12.3661 2.88388C11.878 2.39573 11.878 1.60427 12.3661 1.11612Z"
                                        />
                                        <path
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M23.6161 1.11612C24.1043 0.627961 24.8957 0.627961 25.3839 1.11612L32.8839 8.61612C33.372 9.10427 33.372 9.89573 32.8839 10.3839L25.3839 17.8839C24.8957 18.372 24.1043 18.372 23.6161 17.8839C23.128 17.3957 23.128 16.6043 23.6161 16.1161L30.2322 9.5L23.6161 2.88388C23.128 2.39573 23.128 1.60427 23.6161 1.11612Z"
                                        />
                                    </svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
                <div className="efp-wayfinding-floor__line"></div>
            </div>
        </div>
    );
};

export default WayfindingFloorSelector;
