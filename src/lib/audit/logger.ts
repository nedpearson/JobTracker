type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

class AuditLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private createEntry(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context
    };
  }

  info(message: string, context?: Record<string, unknown>) {
    const entry = this.createEntry("info", message, context);
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    console.log(`[AUDIT-INFO] ${message}`, context || "");
  }

  warn(message: string, context?: Record<string, unknown>) {
    const entry = this.createEntry("warn", message, context);
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    console.warn(`[AUDIT-WARN] ${message}`, context || "");
  }

  error(message: string, context?: Record<string, unknown>) {
    const entry = this.createEntry("error", message, context);
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    console.error(`[AUDIT-ERROR] ${message}`, context || "");
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "development") {
      const entry = this.createEntry("debug", message, context);
      this.logs.push(entry);
      if (this.logs.length > this.maxLogs) {
        this.logs.shift();
      }
      console.debug(`[AUDIT-DEBUG] ${message}`, context || "");
    }
  }

  getLogs(level?: LogLevel, limit = 100): LogEntry[] {
    let filtered = this.logs;
    if (level) {
      filtered = this.logs.filter((log) => log.level === level);
    }
    return filtered.slice(-limit);
  }

  clearLogs() {
    this.logs = [];
  }
}

export const auditLogger = new AuditLogger();
