import React, { useState } from "react";
import classNames from "classnames";
import "./SidebarActions.scss";
import { t } from "../utils/i18n";
import i18next from "i18next";
import CheckboxButton from "./CheckboxButton";

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
    const [animateIcon, setAnimateIcon] = useState(false);

    const handleBookmarkClick = () => {
        setAnimateIcon(true);
        onClickBookmark();

        setTimeout(() => {
            setAnimateIcon(false);
        }, 320);
    };

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
                <CheckboxButton
                    className="efp-visited-btn"
                    aria-label={visited ? i18next.t("Visited") : i18next.t("Not visited")}
                    aria-pressed={visited}
                    checked={visited}
                    label={i18next.t("Visited")}
                    onClick={onClickVisited ?? (() => {})}
                />
            )}
            {showBookmark && (
                <button
                    type="button"
                    className={classNames("efp-actionButton", "efp-actionButton--bookmark", {
                        isActive: inBookmark,
                        animate: animateIcon,
                    })}
                    title={inBookmark ? t("Remove from Bookmarks") : t("Save to Bookmarks")}
                    aria-label={inBookmark ? t("Remove from Bookmarks") : t("Save to Bookmarks")}
                    aria-pressed={inBookmark}
                    onClick={handleBookmarkClick}
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
