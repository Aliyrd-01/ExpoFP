import { convertGpsToLocal, GpsConfig } from "../../../../utils/gps";
import { CurrentPosition } from "../../../../store/RouteStore";
import store from "../../../../store";
import logger from "../../../../tools/logger";
import data from "../../../../data";
import { fpGeo } from "../../../Mapbox/utils/fpGeo";

export default function configGPS() {

    if (data.autoTrackingGps && store.mapboxStore.mapBoxEnabled) {
        trackGPS();
    }
}

function trackGPS() {
    let watcher = navigator.geolocation.watchPosition(
        (pos) => {
            try {
                const localPoint = convertGpsToLocal(
                    pos.coords.latitude,
                    pos.coords.longitude,
                    fpGeo.properties.config as GpsConfig
                );

                if(!localPoint) return;


                const currentPosition = new CurrentPosition(
                    localPoint.x,
                    localPoint.y,
                    null,
                    0,
                    pos.coords.latitude,
                    pos.coords.longitude
                );
                store.routeStore.selectCurrentPosition(currentPosition, false);
            } catch (e) {
                logger.error(e);
            }
        },
        (err) => {
            if (watcher) {
                navigator.geolocation.clearWatch(watcher);
                watcher = null;
            }
            setTimeout(() => trackGPS(), 1000);
        },
        {
            maximumAge: 0,
            enableHighAccuracy: true,
            timeout: 10000,
        }
    );
}
