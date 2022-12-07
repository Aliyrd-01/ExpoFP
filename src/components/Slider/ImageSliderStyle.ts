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

const bulletContainer = {
    position: "absolute",
    bottom: "15px",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
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
    marginTop: `${bulletMargin}px`,
    marginLeft: `${bulletMargin}px`,
    marginRight: `${bulletMargin}px`,
    boxShadow: "2px 2px 2px 2px rgba(0,0,0,0.1)",
};

const fullScreenSubContainer = {
    position: "relative",
    top: "50%",
    transform: "translateY(-50%)",
};

const backdrop = {
    webkitBackdropFilter: "saturate(180%) blur(20px)",
    backdropFilter: "saturate(180%) blur(20px)",
};

export default {
    ImageNavArrowLeft: (isFullScreen: boolean) => ImageNavArrowLeft({ height: isFullScreen ? "40px" : "30px" }),

    ImageNavArrowRight: (isFullScreen: boolean) => ImageNavArrowRight({ height: isFullScreen ? "40px" : "30px" }),

    FullScreenContainer: (isFullScreen: boolean) => (isFullScreen ? fullScreenContainer : {}),

    Backdrop: (useBackdrop: boolean) => (useBackdrop ? backdrop : {}),

    FullScreenIcon: (isFullScreen: boolean) => FullScreenIcon(isFullScreen),

    ImageSlider: (isFullScreen: boolean) => assignObjects(basic, basicRootContainer, isFullScreen ? null : { cursor: "pointer" }),

    NavLeft: assignObjects({ left: 0 }),
    NavRight: assignObjects({ right: 0 }),
    BulletContainer: (bulletLength) => assignObjects(basic, bulletContainer),
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
