import React from "react";
import "./Share.scss";

interface ShareProps {
    title?: string,
    url: string
}

const Share: React.FC<ShareProps> = ({title, url}) => {
    return (
        <div className="share">
            <div className="share__title">
                {title ? title : "Share this Exhibitor with your social Community"}
            </div>
            <div className="share__socials">
                <div className="share__social">
                    <div className="share__circle"></div>
                    <div className="share__name">Facebook</div>
                </div>
                <div className="share__social">
                    <div className="share__circle"></div>
                    <div className="share__name">Twitter</div>
                </div>
                <div className="share__social">
                    <div className="share__circle"></div>
                    <div className="share__name">LinkedIn</div>
                </div>
            </div>
            <div className="share__copy">
                <div className="share__text">or copy link</div>
                <div className="share__input-wrapper">
                    <input type="input" readOnly={true} className="share__input" placeholder={url}/>
                    <button className="share__btn">Copy</button>
                </div>
            </div>
        </div>
    );
};

export default Share;
