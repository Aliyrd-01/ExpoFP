import { SpecialBooth } from "../../store/BoothStore";
import React, { FC } from "react";

interface BoothSpecialProps {
    booth: SpecialBooth;
}

export const BoothSpecial: FC<BoothSpecialProps> = ({ booth }) => {
    return (
        <div className="booth__content -spec">
            <div className="booth__desc" dangerouslySetInnerHTML={{ __html: booth.description }} />
        </div>
    );
};
