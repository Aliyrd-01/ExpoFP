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
    const url = new URL(path, "https://app.expofp.com/");
    url.searchParams.set(TOKEN_KEY, token);
    return url.href;
}
