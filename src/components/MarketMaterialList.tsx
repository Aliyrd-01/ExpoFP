import React from "react";
import { MarketMaterial } from "../data/Data";
import { FileIconSvg, DownloadIconSvg } from "./Icons";
import "./MarketMaterialList.scss";

export type MarketMaterialListProps = {
    list: MarketMaterial[];
};

const MarketMaterialListItem: React.FC<MarketMaterial> = ({ fileName, path }) => {
    return (
        <div className="market-materials__item">
            <a href={path} target="_blank" rel="noopener noreferrer">
                <div className="market-materials__item-name">
                    <div className="market-materials__item-file">
                        <FileIconSvg />
                    </div>
                    <span>{fileName}</span>
                </div>
                <div className="market-materials__item-download">
                    <DownloadIconSvg />
                </div>
            </a>
        </div>
    );
};

const MarketMaterialList: React.FC<MarketMaterialListProps> = ({ list }) => {
    return (
        <div className="market-materials">
            <div className="market-materials__title font-medium">Attached files</div>
            <div className="market-materials__list">
                {list.map((item) => {
                    return <MarketMaterialListItem {...item} key={item.fileName} />;
                })}
            </div>
        </div>
    );
};

export default MarketMaterialList;
