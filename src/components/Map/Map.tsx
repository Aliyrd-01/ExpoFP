import classNames from "classnames";
// TODO: RESTORE - only use what's needed from d3
import * as d3 from "d3";
import { useLocalStore, useObserver } from "mobx-react-lite";
import React, { useEffect, useMemo, useRef } from "react";
import "./Map.scss";


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
