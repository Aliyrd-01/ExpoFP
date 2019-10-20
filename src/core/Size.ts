export default class Size {
    width: number;
    height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    scale(s:number){
        return new Size(this.width * s, this.height * s);
    }
}