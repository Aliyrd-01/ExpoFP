import React from "react";
import { MarketMaterial } from "../data/Data";
import { t } from "../utils/i18n";
import "./MarketMaterialList.scss";

export type MarketMaterialListProps = {
    list: MarketMaterial[];
};

const MarketMaterialListItem: React.FC<MarketMaterial> = ({ fileName, path }) => {
    return (
        <a
            className="market-materials__item"
            href={path}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Download ${fileName}`}
        >
            <div className="market-materials__item-name">
                <div className="market-materials__item-file">
                    <i className="icon-file-solid"></i>
                </div>
                <span>{fileName}</span>
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
            <div className="market-materials__title font-medium">{t("Read More")}</div>
            <div className="market-materials__list" role="list">
                {list.map((item) => (
                    <div role="listitem" key={item.path}>
                        <MarketMaterialListItem {...item} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MarketMaterialList;
