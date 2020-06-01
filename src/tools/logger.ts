import isDebug from "../utils/is-debug";

class Logger {
    public readonly messages: string[] = [];

    log(...args) {
        this.push("DEBUG", args);
        if (!isDebug) return;
        callLogFunc(console.log, args);
    }

    error(...args) {
        this.push("ERROR", args);
        callLogFunc(console.error, args);
    }

    warn(...args) {
        this.push("WARN", args);
        callLogFunc(console.warn, args);
    }

    info(...args) {
        this.push("INFO", args);
        callLogFunc(console.info, args);
    }

    private push(level, args: any[]) {
        const argsMapped = args.map(x => {
            if (typeof x === "object")
                try {
                    return JSON.stringify(x);
                } catch (e) {
                    return e.message;
                }
            return x;
        });
        const message = level + "\t" + new Date().toISOString() + "\t" + argsMapped.join("; ");
        this.messages.push(message);
        const max = 1000;
        if (this.messages.length > max) {
            this.messages.splice(0, max / 2);
        }
    }
}

// fix for IE11
function callLogFunc(func, args) {
    try {
        func.apply(func, args);
    } catch (e) {}
}

export default new Logger();

// //

// declare global {
//     const __logger: typeof logger1;
// }

// extendGlobal({
//     __logger: logger1,
// });
