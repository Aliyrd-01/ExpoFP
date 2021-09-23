import { Booth } from "./BoothStore";

export default class Route {
    public constructor(public from: Booth = null, public to: Booth = null) {}
}
