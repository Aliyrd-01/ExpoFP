class Logger {
    public readonly messages: string[] = [];

    log(...args) {
        this.push("DEBUG", args);
        if (!__settings.debug) return;
        console.log.apply(console.log, args);
    }

    error(...args) {
        this.push("ERROR", args);
        console.error.apply(console.error, args);
    }


    warn(...args) {
        this.push("WARN", args);
        console.warn.apply(console.warn, args);
    }

    info(...args) {
        this.push("INFO", args);
        console.info.apply(console.info, args);
    }

    private push(level, args: any[]) {
        const message = level + "\t" + new Date().toISOString() + "\t" + args.join("; ");
        this.messages.push(message);
        const max = 1000;
        if (this.messages.length > max) {
            this.messages.splice(0, max / 2);
        }
    }
}

export const logger = new Logger();

declare global {
    const __logger: typeof logger;
}

extendGlobal({
    __logger: logger,
});


