const url = new URL(window.location.href);
const c = url.searchParams.get("__data");

let exhibitor: Exhibitor = null;
if (c) {
    exhibitor = JSON.parse(c).exhibitors[0];
}

export default exhibitor;

