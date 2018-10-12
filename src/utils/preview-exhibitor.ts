
let exhibitor: Exhibitor = null;
// if (!__ie) {
const url = new URL(window.location.href);
const c = url.searchParams.get("__data");

if (c) {
    exhibitor = JSON.parse(c).exhibitors[0];
}
// }

export default exhibitor;

