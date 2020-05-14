import React from "react";
import data, { FillMode } from "./ImageSliderData";
import ImagePreLoader from "./ImageSliderPreLoader";
import styles from "./ImageSliderStyle";
import { assignObjects, isTouchDevice } from "./ImageSliderUtil";

interface Props {
    // Required
    images: string[];

    // Optional
    width: string | number;
    height: string | number;
    style?: any;
    slideDuration?: number;
    showNavs?: boolean;
    showBullets?: boolean;
    bgColor?: string;
    useGPURender?: boolean;
    fillMode: FillMode;
    isFullScreen: boolean;

    onClickNav?: (toRight: boolean) => {};
    onClickBullets?: (index: number) => {};
    onStartSlide?: (index: number) => {};
    onCompleteSlide?: (index: number) => {};
}

class State {
    constructor(
        public idx: number,
        public sliding: boolean,
        public currentSlideStyle: any,
        public nextSlideStyle: any,
        public startTouchPoint: { x: number; y: number },
        public isFullScreen: boolean
    ) {}
}

let isTouch = isTouchDevice();

class ImageSlider extends React.Component<Props, State> {
    public static defaultProps = {
        width: "100%",
        height: "250px",
        slideDuration: 0.5,
        showNavs: true,
        showBullets: true,
        bgColor: "black",
        useGPURender: true,
        navStyle: 1,
        fillMode: FillMode.cover,
        isFullScreen: false,

        onClickNav: () => {},
        onClickBullets: () => {},
        onStartSlide: () => {},
        onCompleteSlide: () => {},
    };

    constructor(props: Props) {
        super(props);

        this.onKeyDown = this.onKeyDown.bind(this);

        this.state = new State(
            0,
            false,
            styles.getImageSlide(
                this.getImageUrl(0),
                this.props.slideDuration,
                0,
                this.props.useGPURender,
                props.isFullScreen ? FillMode.contain : this.props.fillMode
            ),
            styles.getImageSlide(
                this.getImageUrl(1),
                this.props.slideDuration,
                1,
                this.props.useGPURender,
                props.isFullScreen ? FillMode.contain : this.props.fillMode
            ),
            null,
            props.isFullScreen
        );

        ImagePreLoader.load(this.getImageUrl(2));
    }

    componentDidMount = () => document.addEventListener("keydown", this.onKeyDown);

    componentWillUnmount = () => document.removeEventListener("keydown", this.onKeyDown);

    onKeyDown = (e: KeyboardEvent) => {
        if (this.state.isFullScreen && e.keyCode === 27) this.onFullScreenChanged();
        else if (e.keyCode == 39) this.onClickNav(true);
        else if (e.keyCode == 37) this.onClickNav(false);
    };

    getImageUrl = (idx: number) => (this.props.images[idx] ? this.props.images[idx] : "");

    isCanSlide = (idx: number) => idx !== this.state.idx && !this.state.sliding;

    isPrevImageAvail = () => this.props.images.length > 0 && this.state.idx > 0;

    isNextImageAvail = () => this.props.images.length > 0 && this.state.idx < this.props.images.length - 1;

    onClickNav = (toRight: boolean) => {
        if ((toRight && !this.isNextImageAvail()) || (!toRight && !this.isPrevImageAvail())) return;

        if (!this.isCanSlide(-1)) {
            return;
        }
        this.props.onClickNav(toRight);
        this.slide(toRight ? this.state.idx + 1 : this.state.idx - 1);
    };

    onClickBullets = (idx: number) => {
        if (!this.isCanSlide(idx)) {
            return;
        }

        this.props.onClickBullets(idx);
        this.slide(idx);
    };

    onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        this.setState({ ...this.state, startTouchPoint: { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY } });
    };

    onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        let target = e.target as HTMLDivElement;

        let x = e.changedTouches[0].clientX;
        let startX = this.state.startTouchPoint.x;
        let centerX = (target.clientLeft + (target.clientLeft + target.clientWidth)) / 2;
        let deltaX = (x - startX) / target.clientWidth;

        this.setState({ ...this.state, startTouchPoint: null }, () => {
            if ((startX < centerX && x > centerX) || (Math.abs(deltaX) > 0.1 && deltaX > 0)) this.onClickNav(false);
            else if ((startX > centerX && x < centerX) || (Math.abs(deltaX) > 0.1 && deltaX < 0)) this.onClickNav(true);
        });
    };

    onFullScreenContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLDivElement).classList.contains("image-slider-full-screen-container") && this.state.isFullScreen)
            this.onFullScreenChanged();
    };

    renderNav = () => ({
        left: this.isPrevImageAvail() ? (
            <button type="button" style={styles.NavLeft} onClick={() => this.onClickNav(false)}>
                {styles.ImageNavArrowLeft(this.state.isFullScreen)}
            </button>
        ) : null,
        right: this.isNextImageAvail() ? (
            <button type="button" style={styles.NavRight} onClick={() => this.onClickNav(true)}>
                {styles.ImageNavArrowRight(this.state.isFullScreen)}
            </button>
        ) : null,
    });

    renderBullets = (length: number, idx: number) => {
        if (length > 1) {
            const bulletList = Array.from({ length }).map((e, i) => (
                <button
                    type="button"
                    className={data.ClassNameBullets}
                    style={i === idx ? styles.BulletActive : styles.BulletNormal}
                    key={`bullet-${i + 1}`}
                    onClick={this.onClickBullets.bind(this, i)}
                />
            ));
            return <div style={styles.BulletContainer(length)}>{bulletList}</div>;
        }
        return null;
    };

    slide = (idx: number) => {
        const toNext = idx > this.state.idx;
        const currentUrl = this.getImageUrl(this.state.idx);
        const nextUrl = this.getImageUrl(idx);
        const nextReadyX = toNext ? 1 : -1;
        const currentOffetX = toNext ? -1 : 1;

        this.setState(
            {
                idx,
                sliding: true,
                currentSlideStyle: styles.getImageSlide(
                    currentUrl,
                    0,
                    0,
                    this.props.useGPURender,
                    this.state.isFullScreen ? FillMode.contain : this.props.fillMode
                ),
                nextSlideStyle: styles.getImageSlide(
                    nextUrl,
                    0,
                    nextReadyX,
                    this.props.useGPURender,
                    this.state.isFullScreen ? FillMode.contain : this.props.fillMode
                ),
            },
            () => {
                // animation slides
                setTimeout(() => {
                    this.setState({
                        currentSlideStyle: styles.getImageSlide(
                            currentUrl,
                            this.props.slideDuration,
                            currentOffetX,
                            this.props.useGPURender,
                            this.state.isFullScreen ? FillMode.contain : this.props.fillMode
                        ),
                        nextSlideStyle: styles.getImageSlide(
                            nextUrl,
                            this.props.slideDuration,
                            0,
                            this.props.useGPURender,
                            this.state.isFullScreen ? FillMode.contain : this.props.fillMode
                        ),
                    });
                }, 50);

                ImagePreLoader.load(this.getImageUrl(idx + 2));
            }
        );

        this.props.onStartSlide(idx + 1);
    };

    onSlideEnd = () => {
        this.setState({
            currentSlideStyle: styles.getImageSlide(
                this.getImageUrl(this.state.idx),
                0,
                0,
                this.props.useGPURender,
                this.state.isFullScreen ? FillMode.contain : this.props.fillMode
            ),
            sliding: false,
        });

        this.props.onCompleteSlide(this.state.idx + 1);
    };

    onFullScreenChanged = () => {
        let isFullScreen = !this.state.isFullScreen;
        let { currentSlideStyle, nextSlideStyle } = this.state;

        this.setState({
            ...this.state,
            currentSlideStyle: styles.getImageSlide(
                this.getImageUrl(this.state.idx),
                0,
                currentSlideStyle.idx,
                this.props.useGPURender,
                isFullScreen ? FillMode.contain : this.props.fillMode
            ),
            nextSlideStyle: styles.getImageSlide(
                this.getImageUrl(this.state.idx),
                0,
                nextSlideStyle.idx,
                this.props.useGPURender,
                isFullScreen ? FillMode.contain : this.props.fillMode
            ),
            isFullScreen,
        });
    };

    render() {
        let height = this.state.isFullScreen ? "80%" : this.props.height;
        const rootStyle = styles.getRootContainer(this.props.width, height, this.props.bgColor, this.state.isFullScreen);
        const imageLength = this.props.images.length;
        const leftNav = !isTouch && this.props.showNavs ? this.renderNav().left : null;
        const rightNav = !isTouch && this.props.showNavs ? this.renderNav().right : null;
        const bullets = this.props.showBullets ? this.renderBullets(imageLength, this.state.idx) : null;
        const renderFullScreenIcon = (
            <div onClick={() => this.onFullScreenChanged()}>{styles.FullScreenIcon(this.state.isFullScreen)}</div>
        );

        return (
            <div
                className="image-slider-full-screen-container"
                onClick={(e) => this.onFullScreenContainerClick(e)}
                style={styles.FullScreenContainer(this.state.isFullScreen)}
            >
                <div className={data.ClassNameRoot} style={assignObjects(rootStyle, this.props.style)}>
                    <div style={styles.getSubContainer(this.props.width, "100%")}>
                        <div
                            style={styles.ImageSlider}
                            onTouchStart={(e) => this.onTouchStart(e)}
                            onTouchEnd={(e) => this.onTouchEnd(e)}
                        >
                            <div style={this.state.currentSlideStyle} onTransitionEnd={this.onSlideEnd} />
                            <div style={this.state.nextSlideStyle} />
                        </div>
                        {leftNav}
                        {rightNav}
                        {bullets}
                    </div>
                </div>
                {renderFullScreenIcon}
            </div>
        );
    }
}

export default ImageSlider;
