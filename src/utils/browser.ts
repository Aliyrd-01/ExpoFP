import * as Bowser from "bowser";
import logger from "../tools/logger";
const ua = window.navigator.userAgent;
const browser = Bowser.getParser(ua);
logger.log("Browser", browser.getBrowserName(), browser.getBrowserVersion(), browser.getOSName(), browser.getEngine()?.name);
export default browser;
