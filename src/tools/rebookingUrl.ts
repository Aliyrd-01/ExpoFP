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

export interface RebookingParams {
    [TOKEN_KEY]: string;
    expoKey: string;
}

export function buildRebookingUrl(path: string, params: RebookingParams) {
    const url = new URL(path, "https://app.expofp.com/");

    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
    }

    return url.href;
}
