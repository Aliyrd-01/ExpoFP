import React from "react";
import ReactDOM from "react-dom";
import Layout from "./components/Layout";
import "./services/routing";
import trackEvent from "./tools/track-event";

trackEvent("load");

export default function renderFloorPlan(el: Element) {
    ReactDOM.render(<Layout />, el);
}
