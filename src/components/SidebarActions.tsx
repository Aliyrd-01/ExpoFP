import React from "react";
import classNames from "classnames";
import "./SidebarActions.scss";
import { t } from "../utils/i18n";
import i18next from "i18next";

export interface SidebarActionsProps {
    inBookmark?: boolean;
    showBookmark?: boolean;
    showDirections?: boolean;
    showShare?: boolean;
    onClickBookmark?: () => void;
    onClickDirections?: () => void;
    onClickShare?: () => void;
}

const SidebarActions: React.FC<SidebarActionsProps> = ({
    inBookmark = false,
    showBookmark = true,
    showDirections = true,
    showShare = true,
    onClickBookmark,
    onClickDirections,
    onClickShare,
}) => {
    return (
        <div className="efp-sidebarActions">
            {showDirections && (
                <button type="button" className="efp-actionButton efp-actionButton--directions" onClick={onClickDirections}>
                    <i className="icon-directions"></i>
                    {t("Directions")}
                </button>
            )}
            {showBookmark && (
                <button
                    type="button"
                    className={classNames("efp-actionButton", "efp-actionButton--bookmark", { isActive: inBookmark })}
                    onClick={onClickBookmark}
                >
                    <i className={inBookmark ? "icon-bookmark-solid" : "icon-bookmark"}></i>
                    {t("Bookmark")}
                </button>
            )}
            {showShare && (
                <button type="button" className="efp-actionButton efp-actionButton--share" onClick={onClickShare}>
                    <i className="icon-share"></i>
                    {i18next.language === "en" && "Share"}
                </button>
            )}
        </div>
    );
};

export default SidebarActions;
