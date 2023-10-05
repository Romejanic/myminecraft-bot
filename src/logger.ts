type LogLevel = "info" | "warn" | "error" | "debug";

function level(level: LogLevel, prefix: string, func: typeof console.log, message: any[]) {
    const timestamp = new Date().toISOString();
    func(timestamp, `[${prefix}]`, `[${level.toUpperCase()}]`, ...message);
}

export default function createLogger(prefix: string) {
    return {
        info: (...message: any)  => level("info", prefix, console.log, message),
        warn: (...message: any)  => level("warn", prefix, console.warn, message),
        error: (...message: any) => level("error", prefix, console.error, message),
        debug: (...message: any) => level("debug", prefix, console.debug, message)
    };
}
