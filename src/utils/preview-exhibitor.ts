const url = new URL(window.location.href);
const c = url.searchParams.get("__data");
const exhibitor: Exhibitor = c ? JSON.parse(c).exhibitors[0] : null;

export default exhibitor;

