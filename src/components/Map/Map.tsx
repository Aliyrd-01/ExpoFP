import "./Map.scss";
import { useObserver, useLocalStore } from "mobx-react-lite";
import classNames from "classnames";
import { useEffect, useRef, useMemo } from "react";
// TODO: RESTORE - only use what's needed from d3
import * as d3 from "d3";

export default function Map() {
    const el = useRef<HTMLCanvasElement>();
    const $canvas = useMemo(() => d3.select(el.current), [el.current]);
    const s = useLocalStore(() => ({
        a: 1
    }));

    useEffect(() => {}, []);

    return useObserver(() => (
        <canvas
            ref={el}
            className={classNames({ map: true, moving: s.moving })}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
        >
            ExpoFP.com
        </canvas>
    ));
}
