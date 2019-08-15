import "./Map.scss";
import { useObserver } from "mobx-react-lite";
import classNames from "classnames";

export default function Map() {


    
    return useObserver(() => (
        <canvas
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
