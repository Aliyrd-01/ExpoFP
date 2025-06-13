import store from "../../../../store";
import { CurrentPosition } from "../../../../store/RouteStore";
import logger from "../../../../tools/logger";
import { convertGpsToLocal, GpsConfig } from "../../../../utils/gps";
import { fpGeo } from "../../../Mapbox/utils/fpGeo";

export default function configGPS() {
    if (store.uiState.gpsEnabled) {
        trackGPS();
    }
}

function trackGPS() {
    let watcher = navigator.geolocation.watchPosition(
        (pos) => {
            try {
                if (!fpGeo) return;

                const localPoint = convertGpsToLocal(
                    pos.coords.latitude,
                    pos.coords.longitude,
                    fpGeo.properties.config as GpsConfig
                );

                if (!localPoint) return;

                const currentPosition = new CurrentPosition(
                    localPoint.x,
                    localPoint.y,
                    null,
                    undefined,
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
