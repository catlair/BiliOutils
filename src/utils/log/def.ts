import type {
  LevelConfigType,
  LevelType,
  LogOptions,
  MessageType,
  SimpleLoggerOptions,
} from '@/types/log';
import { resolvePwd } from '../path';

import winston from 'winston';
import { isBoolean, isError } from '../is';
import { isQingLongPanel, isServerless } from '../env';
import { resolve } from 'node:path';

const LEVEL_VALUE = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'];

const formatTimestamp = winston.format.timestamp({
  format: () => formatTime(new Date(), false),
});

function formatTime(date: Date, hasDate = true) {
  // 月-日 时:分:秒
  if (hasDate) {
    return date.toLocaleString('zh-CN', { hour12: false, timeZone: 'Asia/Shanghai' });
  }
  // 时:分:秒
  return date
    .toLocaleString('zh-CN', {
      hour12: false,
      timeZone: 'Asia/Shanghai',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    .replace(/^24/, '00');
}

function getLevelValues(level: LevelType = 'info') {
  const levelIndex = LEVEL_VALUE.indexOf(level);
  return levelIndex !== -1 ? LEVEL_VALUE.slice(0, levelIndex + 1) : LEVEL_VALUE;
}

function getLogLevel(level: LevelConfigType) {
  if (isBoolean(level)) {
    return level ? LEVEL_VALUE : [];
  }
  return getLevelValues(level);
}

export function resolveLogPath(path: string) {
  const { BILIOUTILS_LOG_DIR } = process.env;
  return BILIOUTILS_LOG_DIR ? resolve(BILIOUTILS_LOG_DIR, path) : resolvePwd(path);
}

export class SimpleLogger {
  public static pushValue = '';
  public static brChar = '\n';
  public static emojis = {
    error: 'error',
    warn: 'warn',
    info: 'info',
    http: 'http',
    verbose: 'verbose',
    debug: 'debug',
    silly: 'silly',
  };

  protected options: SimpleLoggerOptions = {
    console: 'silly',
    file: 'silly',
    push: 'silly',
  };
  protected noFile = false;
  protected logFile = resolveLogPath(`./logs/bt_combined-def.log`);
  protected errorFile = this.logFile;
  protected _format: winston.Logform.Format;

  protected fileLevel: string;
  protected pushLeval: string[];

  protected _console: winston.Logger;
  protected _file: winston.Logger;

  constructor(
    options: SimpleLoggerOptions = {},
    public name = 'default',
  ) {
    this.mergeOptions(options);

    this.pushLeval = getLogLevel(this.options.push);
    this.noFile = isQingLongPanel() || isServerless();

    this._format = winston.format.printf(({ message, timestamp, level }) => {
      return `\u005b${SimpleLogger.emojis[level]} ${timestamp}\u005d ${message}`;
    });
    this.createConsole();
    this.createFile();
  }

  protected mergeOptions(options: Record<string, any>) {
    return Object.assign(this.options, options);
  }

  public log({ level = 'info' }: LogOptions, message: MessageType, emoji?: string) {
    emoji = emoji || SimpleLogger.emojis[level];
    const payload = this.options.payload ? ` \u005b${this.options.payload}\u005d ` : ' ';

    this._console.log(level, `${payload}${message}`);
    if (!this.noFile) {
      this._file.log(level, `${payload}${message}`);
    }

    if (this.pushLeval.includes(level)) {
      this.push(
        `\u005b${emoji} ${formatTime(new Date(), false)}\u005d ${message}${SimpleLogger.brChar}`,
      );
    }
  }

  public error(message: MessageType | Error, error?: MessageType | Error) {
    if (isError(message)) {
      error = message;
      message = '';
    }
    if (!error) {
      this.log({ level: 'error' }, message);
      return;
    }
    if (!isError(error)) {
      this.log({ level: 'error' }, `${message} ${error}`);
      return;
    }
    if (Reflect.has(error, 'message')) {
      this.log({ level: 'error' }, `${message} ${error.message}`);
    }
    if (Reflect.has(error, 'stack')) {
      this.log({ level: 'silly' }, error.stack);
    }
    if (Reflect.has(error, 'cause')) {
      this.log({ level: 'debug' }, error.cause as string);
    }
    if (Reflect.has(error, 'response')) {
      // @ts-ignore
      this.log({ level: 'debug' }, error.response);
    }
  }

  public warn(message: MessageType) {
    this.log({ level: 'warn' }, message);
  }

  public info(message: MessageType) {
    this.log({ level: 'info' }, message);
  }

  public http(message: MessageType) {
    this.log({ level: 'http' }, message, SimpleLogger.emojis.info);
  }

  public verbose(message: MessageType) {
    this.log({ level: 'verbose' }, message);
  }

  public debug(message: MessageType) {
    this.log({ level: 'debug' }, message);
  }

  public silly(message: MessageType) {
    this.log({ level: 'silly' }, message, SimpleLogger.emojis.debug);
  }

  protected push(message: string) {
    SimpleLogger.pushValue += message;
  }

  private createConsole() {
    this._console = winston.createLogger(this.setConsoleLogger());
  }

  private createFile() {
    this._file = winston.createLogger(this.setFileLogger());
  }

  protected setFileLogger({
    logFile = this.logFile,
    errorFile = this.errorFile,
  }: {
    logFile?: string;
    errorFile?: string;
  } = {}) {
    const cl = this.options.file;
    if (cl === false) {
      this._file = (() => undefined) as unknown as winston.Logger;
      return;
    }

    this.fileLevel = cl === true || cl === undefined ? 'silly' : cl;

    const transports: winston.transport[] = [
      this.getFileLogTransport(logFile),
      this.getFileLogTransport(errorFile, 'warn'),
    ];

    return {
      format: formatTimestamp,
      transports,
    };
  }

  protected getFileLogTransport(logFile: string, level?: LevelType) {
    return new winston.transports.File({
      filename: logFile,
      format: this._format,
      level: level || this.fileLevel,
    });
  }

  protected setConsoleLogger() {
    const cl = this.options.console;
    if (cl === false) {
      this._console = (() => undefined) as unknown as winston.Logger;
      return;
    }

    const level = cl === true || cl === undefined ? 'silly' : cl;

    return {
      format: formatTimestamp,
      transports: [
        new winston.transports.Console({
          format: this._format,
          level,
        }),
      ],
    };
  }
}

export const defLogger = new SimpleLogger({
  console: 'debug',
  file: 'debug',
  push: 'debug',
});

export class EmptyLogger {
  constructor() {
    /** empty */
  }

  public log() {
    /** empty */
  }
  public error() {
    /** empty */
  }
  public warn() {
    /** empty */
  }
  public info() {
    /** empty */
  }
  public verbose() {
    /** empty */
  }
  public debug() {
    /** empty */
  }
}
