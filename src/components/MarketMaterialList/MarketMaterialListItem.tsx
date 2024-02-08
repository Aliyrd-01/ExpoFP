import React from "react";
import { MarketMaterial } from "../../data/Data";
import { FileIconSvg, DownloadIconSvg } from "../IconsSVG";
import "./MarketMaterialList.scss";

const MarketMaterialListItem: React.FC<MarketMaterial> = ({ fileName, path }) => {
    return (
        <div className="market-materials__item">
            <a  
                key={fileName}
                href={path}
                target="_blank"
                rel="noopener noreferrer"
            >
                <div className="market-materials__item-name">
                    <div className="wrapper-file-icon"><FileIconSvg /></div>
                    {fileName}
                </div>
                <div className="market-materials__item-download-button wrapper-download-icon">
                    <DownloadIconSvg />
                </div>
            </a>
        </div>
    );
};

export default MarketMaterialListItem;
