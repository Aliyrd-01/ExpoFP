import React from "react";
import { MarketMaterial } from "../../data/Data";
import MarketMaterialListItem from "./MarketMaterialListItem";
import "./MarketMaterialList.scss";

export type MarketMaterialListProps = {
    list: MarketMaterial[]
};

const MarketMaterialList: React.FC<MarketMaterialListProps> = ({ list }) => {
    return (
        <div className="market-materials">
           <div className="market-materials__title font-medium">Attached files</div>
           <div className="market-materials__list">
                {list.map((item) => {
                    return <MarketMaterialListItem {...item} />;
                })}
           </div>
        </div>
    );
};

export default MarketMaterialList;
