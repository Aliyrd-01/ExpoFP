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
        <div className="sidebarActions">
            {showBookmark && (
                <button
                    type="button"
                    className={classNames("actionButton", "actionButton--bookmark", { isActive: inBookmark })}
                    onClick={onClickBookmark}
                >
                    <svg
                        className="icon"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {inBookmark ? (
                            <path
                                d="M8.25002 2.91663C7.56488 2.91663 6.9078 3.1888 6.42333 3.67327C5.93886 4.15774 5.66669 4.81482 5.66669 5.49996V18.3333C5.66669 18.6035 5.81203 18.8528 6.04716 18.9859C6.28229 19.1191 6.57086 19.1154 6.80256 18.9764L11 16.4579L15.1975 18.9764C15.4292 19.1154 15.7177 19.1191 15.9529 18.9859C16.188 18.8528 16.3334 18.6035 16.3334 18.3333V5.49996C16.3334 4.81482 16.0612 4.15774 15.5767 3.67327C15.0922 3.1888 14.4352 2.91663 13.75 2.91663H8.25002Z"
                                fill="#FFA44F"
                            />
                        ) : (
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M8.25002 4.41669C7.9627 4.41669 7.68715 4.53082 7.48399 4.73399C7.28082 4.93715 7.16669 5.2127 7.16669 5.50002V17.0087L10.6141 14.9402C10.8517 14.7977 11.1484 14.7977 11.3859 14.9402L14.8334 17.0087V5.50002C14.8334 5.2127 14.7192 4.93715 14.5161 4.73399C14.3129 4.53082 14.0373 4.41669 13.75 4.41669H8.25002ZM6.42333 3.67333C6.9078 3.18886 7.56488 2.91669 8.25002 2.91669H13.75C14.4352 2.91669 15.0922 3.18886 15.5767 3.67333C16.0612 4.1578 16.3334 4.81488 16.3334 5.50002V18.3334C16.3334 18.6036 16.188 18.8529 15.9529 18.986C15.7177 19.1191 15.4292 19.1155 15.1975 18.9765L11 16.458L6.80256 18.9765C6.57086 19.1155 6.28229 19.1191 6.04716 18.986C5.81203 18.8529 5.66669 18.6036 5.66669 18.3334V5.50002C5.66669 4.81488 5.93886 4.1578 6.42333 3.67333Z"
                                fill="#3D91F7"
                            />
                        )}
                    </svg>
                    <span className="text">{t("Bookmark")}</span>
                </button>
            )}
            {showDirections && (
                <button type="button" className="actionButton actionButton--directions" onClick={onClickDirections}>
                    <svg
                        className="icon"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M6.41667 2C6.83088 2 7.16667 2.33579 7.16667 2.75V10.7314C7.16667 11.1456 6.83088 11.4814 6.41667 11.4814C6.00245 11.4814 5.66667 11.1456 5.66667 10.7314V2.75C5.66667 2.33579 6.00245 2 6.41667 2Z"
                            fill="#3D91F7"
                        />
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M5.886 2.22C6.179 1.927 6.654 1.927 6.947 2.22L10.614 5.886C10.907 6.179 10.907 6.654 10.614 6.947 10.321 7.24 9.846 7.24 9.553 6.947L6.417 3.811 3.28 6.947C2.987 7.24 2.513 7.24 2.22 6.947 1.927 6.654 1.927 6.179 2.22 5.886L5.886 2.22ZM15.053 4.97C15.346 4.677 15.821 4.677 16.114 4.97L19.78 8.636C20.073 8.929 20.073 9.404 19.78 9.697L16.114 13.364C15.821 13.657 15.346 13.657 15.053 13.364 14.76 13.071 14.76 12.596 15.053 12.303L18.189 9.167 15.053 6.03C14.76 5.737 14.76 5.263 15.053 4.97Z"
                            fill="#3D91F7"
                        />
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M16.5 9.91667C14.0246 9.91667 11.6507 10.9 9.90034 12.6503C8.15 14.4007 7.16667 16.7746 7.16667 19.25C7.16667 19.6642 6.83088 20 6.41667 20C6.00245 20 5.66667 19.6642 5.66667 19.25C5.66667 16.3768 6.80803 13.6213 8.83968 11.5897C10.8713 9.55803 13.6268 8.41667 16.5 8.41667H19.25C19.6642 8.41667 20 8.75245 20 9.16667C20 9.58088 19.6642 9.91667 19.25 9.91667H16.5Z"
                            fill="#3D91F7"
                        />
                    </svg>
                    <span className="text">{t("Directions")}</span>
                </button>
            )}
            {showShare && (
                <button type="button" className="actionButton actionButton--share" onClick={onClickShare}>
                    <svg
                        className="icon"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12.083 16.042C12.083 14.362 13.445 13 15.125 13 16.805 13 18.167 14.362 18.167 16.042 18.167 17.722 16.805 19.083 15.125 19.083 13.445 19.083 12.083 17.722 12.083 16.042ZM15.125 14.5C14.274 14.5 13.583 15.19 13.583 16.042 13.583 16.893 14.274 17.583 15.125 17.583 15.977 17.583 16.667 16.893 16.667 16.042 16.667 15.19 15.977 14.5 15.125 14.5ZM12.083 5.042C12.083 3.362 13.445 2 15.125 2 16.805 2 18.167 3.362 18.167 5.042 18.167 6.722 16.805 8.083 15.125 8.083 13.445 8.083 12.083 6.722 12.083 5.042ZM15.125 3.5C14.274 3.5 13.583 4.19 13.583 5.042 13.583 5.893 14.274 6.583 15.125 6.583 15.977 6.583 16.667 5.893 16.667 5.042 16.667 4.19 15.977 3.5 15.125 3.5ZM2.917 10.542C2.917 8.862 4.279 7.5 5.958 7.5 7.638 7.5 9 8.862 9 10.542 9 12.222 7.638 13.583 5.958 13.583 4.279 13.583 2.917 12.222 2.917 10.542ZM5.958 9C5.107 9 4.417 9.69 4.417 10.542 4.417 11.393 5.107 12.083 5.958 12.083 6.81 12.083 7.5 11.393 7.5 10.542 7.5 9.69 6.81 9 5.958 9Z"
                            fill="#3D91F7"
                        />
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M7.915 8.496 13.415 5.746 14.085 7.087 8.585 9.837 7.915 8.496ZM13.415 15.338 7.915 12.588 8.585 11.246 14.085 13.996 13.415 15.338Z"
                            fill="#3D91F7"
                        />
                    </svg>
                    {i18next.language === "en" && <span className="text">Share</span>}
                </button>
            )}
        </div>
    );
};

export default SidebarActions;
