interface Painter {
    matrix?: Float32Array;
    ptscale?: number;
    dim?: number;
    orderPriority: number;
    preparePaint();
    paint();
}
