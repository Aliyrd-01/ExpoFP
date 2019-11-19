import "array-flat-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import Layout from "./components/Layout";
// import App from "./App";
// import "./tools/logger";
import "./services/routing";
import reportError from "./tools/report-error";
import trackEvent from "./tools/track-event";

window.addEventListener("error", reportError);

ReactDOM.render(<Layout />, document.getElementById("app"));

trackEvent("load");
