// import isWorker from "./is-worker";
import * as Bowser from "bowser";
import logger from "../tools/logger";
const ua = (global as any).navigator.userAgent;
const browser = Bowser.getParser(ua);
logger.log("Browser", browser.getBrowserName(), browser.getBrowserVersion(), browser.getOSName(), browser.getEngine()?.name);
export default browser;
