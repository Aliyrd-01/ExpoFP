import Matrix from "../Matrix";

export default interface Painter {
    matrix?: Float32Array;
    ptscale?: number;
    dim?: number;
    orderPriority: number;
    matrixObj?: Matrix;
    preparePaint();
    paint();
}
