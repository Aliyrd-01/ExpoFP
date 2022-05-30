import logger from "./logger";

let timeoutId: number;

export default function reportError(e: Partial<ErrorEvent>) {
    if (timeoutId || e.filename.indexOf("expofp.com") === -1) return;

    const ignoredErrors = [/loading chunk \d{1,2}\b/i];
    const ignoreError = ignoredErrors.some((err) => err.test(e.message));
    if (ignoreError) return;

    timeoutId = window.setTimeout(async function () {
        //const ipData = await getIpData();

        const language = navigator.languages && navigator.languages.length ? navigator.languages[0] : navigator.language;
        const data = {
            host: document.location.host,
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno,
            stack: e.error?.stack,
            log: logger.messages.join("\n"),
            userAgent: navigator.userAgent,
            language,
            group: "FP",
            url: document.location,
            subject: "FP JS error: " + document.location.host, // + " in " + ipData.country,
            //...ipData
        };

        logger.info("Sending error report", data);

        await Promise.all([sendEmailMessage(data), sendSlackMessage(data)]);
    }, 2000);
}

async function sendEmailMessage(data) {
    if (process.env.NODE_ENV !== "production") return;
    const rawResponse = await fetch("https://app.expofp.com/api/report-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    logger.log("Reporter response: ", await rawResponse.text());
}

async function sendSlackMessage(data) {
    if (process.env.NODE_ENV !== "production") return;
    const slackObj = createSlackMessage(data);
    const rawResponse = await fetch("https://msg.expofp.com/v1/post-message/" + window.location.hostname, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slackObj),
    });
    logger.log("Slack reporter response: ", await rawResponse.text());
}

// sendSlackMessage({
//     subject: "123",
//     someData: "123",
//     someData2: "123"
// });

function createSlackMessage(data) {
    const blocksData = JSON.parse(JSON.stringify(data));
    delete blocksData.subject;
    delete blocksData.message;
    delete blocksData.stack;
    delete blocksData.log;
    const blocks = [];
    blocks.push({
        type: "section",
        text: {
            type: "mrkdwn",
            text: `:warning:* ${data.subject}*`,
        },
    });
    blocks.push({
        type: "section",
        text: {
            type: "plain_text",
            text: data.message + " → " + (data.stack || "").split("\n")[0],
        },
    });
    // blocks.push({
    //     type: "divider"
    // });

    // for (const key of Object.keys(blocksData)) {
    //     blocks.push({
    //         type: "section",
    //         text: {
    //             type: "mrkdwn",
    //             text: `*${key}*`
    //         }
    //     });

    //     blocks.push({
    //         type: "section",
    //         text: {
    //             type: "plain_text",
    //             text: (blocksData[key] || "undefined").toString()
    //         }
    //     });
    // }

    const res = {
        channel: "#fp-errors",
        username: "error-reporter-bot",
        type: "mrkdwn",
        text: data.subject,
        blocks: blocks,
    };
    return res;
}

// async function getIpData() {
//     try {
//         const ipInfoRequest = await fetch("https://geo.ipify.org/api/v1?apiKey=at_3dMzE1vaZp2Kd8NxMV7HukiFFjutg");
//         const ipInfo = await ipInfoRequest.json();

//         logger.log("ipify", ipInfo, ipInfoRequest);

//         if (ipInfoRequest.ok) {
//             return {
//                 ip: ipInfo.ip,
//                 ...ipInfo.location,
//             };
//         } else {
//             return { ip: ipInfo.messages };
//         }
//     } catch (e) {
//         logger.error(e);
//         return { ip: e.message };
//     }
// }
