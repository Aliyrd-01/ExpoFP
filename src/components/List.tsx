import { remsToPixels } from "../utils";

const n = Math.ceil((Math.max(window.innerHeight, window.innerWidth) - remsToPixels(3.5 + 2)) / remsToPixels(3.5));