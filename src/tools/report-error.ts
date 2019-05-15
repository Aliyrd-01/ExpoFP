let timeoutId: number;

export default function reportError(e: Partial<ErrorEvent>) {
    __logger.error('Handling error', e.error)

    if (timeoutId) return;

    timeoutId = window.setTimeout(async function () {
        const language = (navigator.languages && navigator.languages.length) ? navigator.languages[0] : navigator.language;
        const data = {
            host: document.location.host,
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno,
            stack: e.error.stack,
            log: __logger.messages.join("\n"),
            userAgent: navigator.userAgent,
            language,
        };

        const rawResponse = await fetch('https://expofp.com/api/report-fp-error', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        __logger.log('Reporter response: ', await rawResponse.text());
    }, 2000);
}