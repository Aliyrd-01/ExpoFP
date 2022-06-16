import React from "react";
import classNames from "classnames";
import "./SidebarActions.scss";
import { t } from "../utils/i18n";
import i18next from "i18next";
const sprite = require("/public/icons/actions-sprite.svg") as string;

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
        <div className="sidebarActions">
            {showBookmark && (
                <button
                    type="button"
                    className={classNames("actionButton", "actionButton--bookmark", { isActive: inBookmark })}
                    onClick={onClickBookmark}
                >
                    <svg className="icon">
                        {inBookmark ? (
                            <use xlinkHref={`${sprite}#bookmark-line-active`}></use>
                        ) : (
                            <use xlinkHref={`${sprite}#bookmark-line`}></use>
                        )}
                    </svg>
                    <span className="text">{t("Bookmark")}</span>
                </button>
            )}
            {showDirections && (
                <button type="button" className="actionButton actionButton--directions" onClick={onClickDirections}>
                    <svg className="icon">
                        <use xlinkHref={`${sprite}#directions-line`}></use>
                    </svg>
                    <span className="text">{t("Directions")}</span>
                </button>
            )}
            {showShare && (
                <button type="button" className="actionButton actionButton--share" onClick={onClickShare}>
                    <svg className="icon">
                        <use xlinkHref={`${sprite}#share-line`}></use>
                    </svg>
                    <span className="text">{i18next.language === "en" && "Share"}</span>
                </button>
            )}
        </div>
    );
};

export default SidebarActions;
