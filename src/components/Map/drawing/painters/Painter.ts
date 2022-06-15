export default interface Painter {
    id: string;
    matrix?: Float32Array;
    ptscale?: number;
    dim?: number;
    orderPriority: number;
    visible: boolean;
    preparePaint();
    paint();
}
