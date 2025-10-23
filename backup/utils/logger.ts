import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Custom logger for tests
 */
export class Logger {
  private logFile?: string;

  constructor(logFile?: string) {
    this.logFile = logFile;
  }

  /**
   * Log a message
   */
  private log(level: LogLevel, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    
    // Console output
    console.log(logMessage);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }

    // File output
    if (this.logFile) {
      const fullMessage = data 
        ? `${logMessage}\n${JSON.stringify(data, null, 2)}\n`
        : `${logMessage}\n`;
      
      fs.appendFileSync(this.logFile, fullMessage);
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log info message
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log error message
   */
  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * Log test step
   */
  step(description: string, callback?: () => Promise<void>): void {
    if (callback) {
      test.step(description, async () => {
        this.info(`Test Step: ${description}`);
        await callback();
      });
    } else {
      this.info(`Test Step: ${description}`);
    }
  }
}

/**
 * Create logger instance
 */
export function createLogger(testName?: string): Logger {
  if (testName) {
    const logDir = path.join(process.cwd(), 'test-results', 'logs');
    fs.mkdirSync(logDir, { recursive: true });
    
    const logFile = path.join(logDir, `${testName}-${Date.now()}.log`);
    return new Logger(logFile);
  }
  
  return new Logger();
}

// Default logger instance
export const logger = createLogger();



