import React from "react";
const ClassNameRoot = "image-slider";
const ClassNameNavs = `${ClassNameRoot}-navs`;
const ClassNameBullets = `${ClassNameRoot}-bullets`;

export enum FillMode {
    "cover",
    "contain",
}

export const ImageNavArrowLeft = (style: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 50 234" style={style}>
        <path d="M25,112L45,22C50,7,29,0,25,17L2.845342751,110.673876883Q0,124,3.433705391,134.796743451L25,222C29,234,48,229,45,217L26,135Q22,123,25,112Z" />
    </svg>
);

export const ImageNavArrowRight = (style: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 50 234" style={style}>
        <path d="M25,112L5,22C0,7,21,0,25,17L47.154657249,110.673876883Q50,124,46.566294609,134.796743451L25,222C21,234,2,229,5,217L24,135Q28,123,25,112Z" />
    </svg>
);

export const FullScreenIcon = (inFullMode: boolean, style: any) =>
    !inFullMode ? (
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 800 800" style={style}>
            <g>
                <path d="M0,0L300,0C360,0,360,100,300,100L100,100L100,300C100,360,0,360,0,300Z" />
                <path d="M800,0L500,0C440,0,440,100,500,100L700,100L700,300C700,360,800,360,800,300Z" />
                <path d="M0,800L300,800C360,800,360,700,300,700L100,700L100,500C100,440,0,440,0,500Z" />
                <path d="M800,800L500,800C440,800,440,700,500,700L700,700L700,500C700,440,800,440,800,500Z" />
            </g>
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 890.954544294 890.954544294" style={style}>
            <g>
                <path d="M49.302354415,120.013032534C0,70.710678118,70.710678118,0,120.013032532,49.302354413L841.237697892,770.527019774C890.954544294,820.243866176,820.243866176,890.954544294,770.527019776,841.237697895Z" />
                <path d="M770.941511761,49.302354415C820.243866176,0,890.954544294,70.710678118,841.652189881,120.013032532L120.42752452,841.237697893C70.710678118,890.954544294,0,820.243866176,49.7168464,770.527019775Z" />
            </g>
        </svg>
    );

export default {
    ClassNameRoot,
    ClassNameNavs,
    ClassNameBullets,
    ImageNavArrowLeft,
    ImageNavArrowRight,
};
