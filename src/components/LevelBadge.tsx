import React from "react";

import "./LevelBadge.scss";

interface LevelBadgeProps {
    level: string;
}

const shouldShowPrefix = (input: string): boolean => {
    return /^\d+$/.test(input);
};

export const LevelBadge: React.FC<LevelBadgeProps> = ({ level }) => {
    if (!level) return null;

    return (
        <div className="efp-level-badge">
            <span>
                {shouldShowPrefix(level) && <span>Level&nbsp;</span>}
                <span>{level}</span>
            </span>
        </div>
    );
};

export default LevelBadge;
