

export function subscribeToZoomChange(func){

}


export function getCurrentMatrixScale(){

}

let zoomTranform: ZoomTranform = { k: 1, x: 0, y: 0 };
type ZoomTranform = { k: number, x: number, y: number };

export function applyZoomTransform(transform: { k: number, x: number, y: number }) {
    zoomTranform = transform;
}