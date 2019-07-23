let timeoutId: number;

export default function reportError(e: Partial<ErrorEvent>) {
    __logger.error('Handling error', e.error)

    if (timeoutId) return;

    timeoutId = window.setTimeout(async function () {

        const ipData = await getIpData();

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
            ...ipData
        };

        console.log("Sending error report", data);

        const rawResponse = await fetch('https://expofp.com/api/report-fp-error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        __logger.log('Reporter response: ', await rawResponse.text());
    }, 2000);
}

async function getIpData() {
    try {
        const ipInfoRequest = await fetch('https://geo.ipify.org/api/v1?apiKey=at_3dMzE1vaZp2Kd8NxMV7HukiFFjutg');
        const ipInfo = await ipInfoRequest.json();

        __logger.log('ipify', ipInfo, ipInfoRequest);

        if (ipInfoRequest.ok) {
            return {
                ip: ipInfo.ip,
                ...ipInfo.location
            }
        } else {
            return { ip: ipInfo.messages };
        }
    }
    catch (e) {
        __logger.error(e);
        return { ip: e.message };
    }
}