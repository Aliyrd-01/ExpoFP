import React, { useEffect, useState } from "react";
import "./Share.scss";
import { observer } from "mobx-react-lite";
import { uiState } from "../store";

interface ShareProps {
    title?: string;
}

const Share: React.FC<ShareProps> = ({ title }) => {
    const [url, setUrl] = useState(null);

    useEffect(() => {
        setUrl(window.location.href);
        // eslint-disable-next-line
    }, [uiState.selectedExhibitor]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(url);
    };

    const encodedUrl = encodeURI(url);
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    const twitterShareUrl = `https://twitter.com/share?url=${encodedUrl}`;
    const linkedinShareUrl = `https://linkedin.com/shareArticle?url=${encodedUrl}`;

    return (
        <div className="share">
            <div className="share__title">{title ? title : `Share ${uiState.selectedExhibitor?.name}`}</div>
            <div className="share__socials">
                <a href={facebookShareUrl} rel="noopener noreferrer" target="_blank" className="share__social">
                    <div className="share__circle">
                        <div className="share__icon facebook"></div>
                    </div>
                    <div className="share__name">Facebook</div>
                </a>
                <a href={twitterShareUrl} rel="noopener noreferrer" target="_blank" className="share__social">
                    <div className="share__circle">
                        <div className="share__icon twitter"></div>
                    </div>
                    <div className="share__name">Twitter</div>
                </a>
                <a href={linkedinShareUrl} rel="noopener noreferrer" target="_blank" className="share__social">
                    <div className="share__circle">
                        <div className="share__icon linkedin"></div>
                    </div>
                    <div className="share__name">LinkedIn</div>
                </a>
            </div>
            <div className="share__copy">
                <div className="share__text">or copy link</div>
                <div className="share__input-wrapper" onClick={copyToClipboard}>
                    <input type="input" readOnly={true} className="share__input" placeholder={url} />
                    <button className="share__btn">Copy</button>
                </div>
            </div>
        </div>
    );
};

export default observer(Share);
