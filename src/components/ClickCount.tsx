import React, { FC } from "react";
import "./ClickCount.scss";

interface ClickCountProps {
    count: number;
}

const ClickCount: FC<ClickCountProps> = ({ count }) => {
    return <div className="click-count">Click count: {count}</div>;
};

export default ClickCount;
