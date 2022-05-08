export default interface Painter {
    matrix?: Float32Array;
    ptscale?: number;
    dim?: number;
    orderPriority: number;
    visible:boolean;
    preparePaint();
    paint();
}
