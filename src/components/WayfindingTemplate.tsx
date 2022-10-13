import React from "react";
import "./WayfindingTemplate.scss";
import Autocomplete, { OptionObject } from "./Autocomplete";
import WayInformation, { WayInformationItem } from "./WayInformation";

export interface WayfindingTemplateProps {
    options: string[] | (OptionObject | any)[];
    fromValue?: string;
    toValue?: string;
    showForm?: boolean;
    showInfo?: boolean;
    routeFound?: boolean;
    infoItems?: WayInformationItem[];
    infoAccessible?: boolean;
    onChangeFrom?: (val: string) => void;
    onChangeTo?: (val: string) => void;
    onSwitch?: () => void;
    onClickInfo?: () => void;
}

const WayfindingTemplate: React.FC<WayfindingTemplateProps> = ({
    options = [],
    fromValue = "",
    toValue = "",
    showForm = true,
    showInfo = false,
    routeFound = false,
    infoItems = [],
    infoAccessible,
    onChangeFrom,
    onChangeTo,
    onSwitch,
    onClickInfo,
}) => {
    return (
        <div className="efp-wayfinding">
            {showForm && (
                <div className="efp-wayfindingForm">
                    <div className="efp-wayfindingForm__icons">
                        <div className="efp-wayfindingForm__icons-item is-from"></div>
                        <div className="efp-wayfindingForm__icons-item is-to"></div>
                    </div>
                    <div className="efp-wayfindingForm__controls">
                        <div style={{ marginBottom: 10 }}>
                            <Autocomplete
                                placeholder="Choose starting point"
                                options={options}
                                value={fromValue}
                                onChange={onChangeFrom}
                            />
                        </div>
                        <div>
                            <Autocomplete placeholder="Select to" options={options} value={toValue} onChange={onChangeTo} />
                        </div>
                    </div>
                    <button type="button" className="efp-wayfindingForm__switch" onClick={onSwitch}></button>
                </div>
            )}
            {showInfo && (
                <div className="efp-wayfindingInfo">
                    {routeFound ? (
                        <WayInformation items={infoItems} accessible={infoAccessible} onClick={onClickInfo} />
                    ) : (
                        <div className="efp-wayfindingError">Route not found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WayfindingTemplate;
