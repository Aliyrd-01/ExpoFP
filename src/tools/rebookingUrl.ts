const TOKEN_KEY = "rt";

export function getRebookingTokenFromQuery() {
    return new URLSearchParams(decodeURIComponent(window.location.search)).get(TOKEN_KEY);
}

export function getRebookingToken() {
    let token = getRebookingTokenFromQuery();

    if (!token) {
        token = sessionStorage.getItem(TOKEN_KEY);
    }

    return token;
}

export function retainRebookingToken(token: string) {
    sessionStorage.setItem(TOKEN_KEY, token);
}

export function buildRebookingUrl(path: string, token: string) {
    const origin =  (
        // FIXME: Remove `sessionStorage.getItem("debug") === "1"` when the app is ready for production
        (process.env.NODE_ENV === "development" || sessionStorage.getItem("debug") === "1")
            ? "https://esm-web-show-app.herokuapp.com/"
            : "https://app.expofp.com/"
    );

    const url = new URL(path, origin);
    url.searchParams.set(TOKEN_KEY, token);

    return url.href;
}
