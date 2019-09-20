import React from "react";
import ReactDOM from "react-dom";
import Layout from "./components/Layout";
// import App from "./App";
// import "./tools/logger";
import "./services/routing";
import trackEvent from './tools/track-event';


import reportError from "./tools/report-error";
window.addEventListener("error", reportError);

ReactDOM.render(<Layout />, document.getElementById("app"));

trackEvent("load")
