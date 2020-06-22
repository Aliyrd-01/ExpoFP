import { FillMode, FullScreenIcon, ImageNavArrowLeft, ImageNavArrowRight } from "./ImageSliderData";
import { assignObjects } from "./ImageSliderUtil";

const fillColor = "#FFFFFF";

const basic = {
    display: "block",
    margin: "0",
    padding: "0",
    border: "0",
};
const basicRootContainer = {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
};

const fullScreenContainer = {
    position: "fixed",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    padding: "20px",
    zIndex: "999",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
};

const basicSlide = {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    backgroundSize: "cover",
};

export const containSlide = {
    backgroundSize: "contain",
    backgroundPosition: "center",
};

const basicNav = {
    position: "absolute",
    top: "50%",
    transform: "translate(0, -50%)",
    padding: "50px 20px",
    cursor: "pointer",
    outline: "none",
    background: "none",
};
const bulletContainer = {
    position: "absolute",
    left: "50%",
    bottom: "15px",
};
const bulletSize = 15;
const bulletMargin = 3;
const basicBullet = {
    display: "inline-block",
    cursor: "pointer",
    outline: "none",
    background: "none",
    borderRadius: "50%",
    border: `2px solid ${fillColor}`,
    width: `${bulletSize}px`,
    height: `${bulletSize}px`,
    marginLeft: `${bulletMargin}px`,
    marginRight: `${bulletMargin}px`,
};

const fullScreenSubContainer = {
    position: "relative",
    top: "50%",
    transform: "translateY(-50%)",
};

const fullScreenIcon = (scale: number) => ({
    position: "absolute",
    right: `${scale * 10}px`,
    top: `${scale * 10}px`,
    width: `${scale * 25}px`,
    cursor: "pointer",
});

export default {
    ImageNavArrowLeft: (isFullScreen: boolean) =>
        ImageNavArrowLeft(assignObjects({ height: isFullScreen ? "100px" : "50px" }, { fill: fillColor })),

    ImageNavArrowRight: (isFullScreen: boolean) =>
        ImageNavArrowRight(assignObjects({ height: isFullScreen ? "100px" : "50px" }, { fill: fillColor })),

    FullScreenContainer: (isFullScreen: boolean) => (isFullScreen ? fullScreenContainer : {}),

    FullScreenIcon: (isFullScreen: boolean) =>
        FullScreenIcon(isFullScreen, assignObjects(fullScreenIcon(isFullScreen ? 1.5 : 1), { fill: fillColor })),

    ImageSlider: assignObjects(basic, basicRootContainer),

    NavLeft: assignObjects(basic, basicNav, { left: 0 }),
    NavRight: assignObjects(basic, basicNav, { right: 0 }),
    BulletContainer: (bulletLength) =>
        assignObjects(basic, bulletContainer, { marginLeft: `-${(bulletLength * (bulletSize + bulletMargin * 2)) / 2}px` }),
    BulletNormal: assignObjects(basic, basicBullet),
    BulletActive: assignObjects(basic, basicBullet, { background: fillColor }),

    // methods
    getRootContainer: (width, height, bgColor, isFullScreen: boolean) =>
        assignObjects(
            basic,
            {
                overflow: "hidden",
                width,
                height,
                background: isFullScreen ? "transparent" : bgColor,
            },
            isFullScreen ? fullScreenSubContainer : {}
        ),
    getSubContainer: (width, height) =>
        assignObjects(basic, {
            position: "absolute",
            overflow: "hidden",
            width,
            height,
        }),
    getImageSlide: (url, duration, idx, isGpuRender, fillMode: FillMode) =>
        assignObjects(
            basicSlide,
            {
                overflow: "hidden",
                transition: `${duration}s`,
                backgroundImage: `url("${url}")`,
                transform: isGpuRender ? `translate3d(${idx * 100}%, 0px, 0px)` : `translate(${idx * 100}%, 0px)`,
            },
            fillMode === FillMode.cover ? {} : containSlide
        ),
};
