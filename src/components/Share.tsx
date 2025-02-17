import React, { useState } from "react";
import classNames from "classnames";
import "./Share.scss";

export interface ShareProps {
    title?: string;
    url?: string;
}

const Share: React.FC<ShareProps> = ({ title, url }) => {
    const [isCopied, setIsCopied] = useState(false);
    const encodedUrl = encodeURI(url);
    const shareUrl = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        xcom: `https://x.com/share?url=${encodedUrl}`,
        linkedin: `https://linkedin.com/shareArticle?url=${encodedUrl}`,
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };
    return (
        <div className="share">
            <h3>Share {title}</h3>
            <div className="share__socials">
                <a href={shareUrl.facebook} rel="noopener noreferrer" target="_blank" className="share-social facebook">
                    <div className="share-social__icon">
                        <i className="icon-facebook"></i>
                    </div>
                    <div className="share-social__title">Facebook</div>
                </a>
                <a href={shareUrl.xcom} rel="noopener noreferrer" target="_blank" className="share-social xcom">
                    <div className="share-social__icon">
                        <i className="icon-twitter-x"></i>
                    </div>
                    <div className="share-social__title">X.COM</div>
                </a>
                <a href={shareUrl.linkedin} rel="noopener noreferrer" target="_blank" className="share-social linkedin">
                    <div className="share-social__icon">
                        <i className="icon-linkedin"></i>
                    </div>
                    <div className="share-social__title">LinkedIn</div>
                </a>
            </div>
            <div className="share__copy">
                <span>or copy link</span>
                <div className="share__copy-input">
                    <input type="text" defaultValue={url} />
                    <button className={classNames({ isCopied: isCopied })} onClick={copyToClipboard}>
                        {isCopied ? "Copied!" : "Copy"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Share;
