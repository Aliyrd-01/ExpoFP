import React from "react";
import { MarketMaterial } from "../data/Data";
import "./MarketMaterialList.scss";

export type MarketMaterialListProps = {
    list: MarketMaterial[];
};

const MarketMaterialListItem: React.FC<MarketMaterial> = ({ fileName, path }) => {
    return (
        <a className="market-materials__item" href={path} target="_blank" rel="noopener noreferrer">
            <div className="market-materials__item-file">
                <i className="icon-file-solid"></i>
            </div>

            <div className="market-materials__item-name">{fileName}</div>

            <div className="market-materials__item-download">
                <i className="icon-download"></i>
            </div>
        </a>
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
