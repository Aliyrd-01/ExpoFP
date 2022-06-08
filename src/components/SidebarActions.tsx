import React from "react";
import classNames from "classnames";
import "./SidebarActions.scss";
const sprite = require("/public/icons/actions-sprite.svg") as string;

export interface SidebarActionsProps {
    inBookmark?: boolean;
    showDirections?: boolean;
    onClickBookmark?: () => void;
    onClickDirections?: () => void;
    onClickShare?: () => void;
}

const SidebarActions: React.FC<SidebarActionsProps> = ({
    inBookmark = false,
    showDirections = true,
    onClickBookmark,
    onClickDirections,
    onClickShare,
}) => {
    return (
        <div className="sidebarActions">
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
                Bookmark
            </button>
            {showDirections && (
                <button type="button" className="actionButton actionButton--directions" onClick={onClickDirections}>
                    <svg className="icon">
                        <use xlinkHref={`${sprite}#directions-line`}></use>
                    </svg>
                    Directions
                </button>
            )}
            <button type="button" className="actionButton actionButton--share" onClick={onClickShare}>
                <svg className="icon">
                    <use xlinkHref={`${sprite}#share-line`}></use>
                </svg>
                Share
            </button>
        </div>
    );
};

export default SidebarActions;
