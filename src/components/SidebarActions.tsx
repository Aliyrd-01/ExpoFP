import React from "react";
import classNames from "classnames";
import "./SidebarActions.scss";
import { t } from "../utils/i18n";
import i18next from "i18next";
import ToggleButton from "./ToggleButton";

export interface SidebarActionsProps {
    inBookmark?: boolean;
    visited?: boolean;
    showVisited?: boolean;
    showBookmark?: boolean;
    showDirections?: boolean;
    showShare?: boolean;
    onClickBookmark?: () => void;
    onClickVisited?: () => void;
    onClickDirections?: () => void;
    onClickShare?: () => void;
}

const SidebarActions: React.FC<SidebarActionsProps> = ({
    inBookmark = false,
    visited = false,
    showVisited = false,
    showBookmark = true,
    showDirections = true,
    showShare = true,
    onClickBookmark,
    onClickVisited,
    onClickDirections,
    onClickShare,
}) => {
    return (
        <div className="efp-sidebarActions" role="toolbar" aria-label="Sidebar Actions">
            {showDirections && (
                <button
                    type="button"
                    className="efp-actionButton efp-actionButton--directions"
                    onClick={onClickDirections}
                    title={t("Directions")}
                    aria-label={t("Directions")}
                >
                    <i className="icon-directions" aria-hidden="true"></i>
                    {t("Directions")}
                </button>
            )}
            {showVisited && (
                <ToggleButton
                    className="efp-visited-btn"
                    toggled={visited}
                    aria-label={visited ? i18next.t("Visited") : i18next.t("Not visited")}
                    aria-pressed={visited}
                    onClick={onClickVisited ?? (() => {})}
                />
            )}
            {showBookmark && (
                <button
                    type="button"
                    className={classNames("efp-actionButton", "efp-actionButton--bookmark", { isActive: inBookmark })}
                    title={inBookmark ? t("Remove from Bookmarks") : t("Save to Bookmarks")}
                    aria-label={inBookmark ? t("Remove from Bookmarks") : t("Save to Bookmarks")}
                    aria-pressed={inBookmark}
                    onClick={onClickBookmark}
                >
                    <i className={inBookmark ? "icon-bookmark-solid" : "icon-bookmark"} aria-hidden="true"></i>
                </button>
            )}
            {showShare && (
                <button
                    type="button"
                    className="efp-actionButton efp-actionButton--share"
                    title={t("Share")}
                    aria-label={t("Share")}
                    onClick={onClickShare}
                >
                    <i className="icon-share" aria-hidden="true"></i>
                </button>
            )}
        </div>
    );
};

export default SidebarActions;
