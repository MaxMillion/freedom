/*globals fdom, process, console */
/*jslint indent:2,sloppy:true */
/**
 * A FreeDOM logging provider that logs to chrome, firefox, and node consoles.
 * @Class Logger_console
 * @constructor
 * @private
 * @param {App} app The application creating this provider, in practice unset.
 */
var Logger_console = function (app) {
  this.level = (app.config && app.config.debug) || 'log';
  this.console = (app.config && app.config.global.console);
  fdom.util.handleEvents(this);
};

/**
 * Logging levels, for filtering output.
 * @private
 * @static
 */
Logger_console.level = {
  "debug": 0,
  "info": 1,
  "log": 2,
  "warn": 3,
  "error": 4
};

/**
 * Print a message with appropriate formatting.
 * @method print
 */
Logger_console.prototype.print = function (severity, source, msg) {
  var arr = msg;
  if (typeof this.console === 'undefined') {
    return;
  }
  if (typeof arr === 'string') {
    arr = [arr];
  }
  
  if (Logger_console.level[this.level] !== undefined &&
      Logger_console.level[severity] < Logger_console.level[this.level]) {
    return;
  }
  
  if (typeof process !== 'undefined' && source) {
    arr.unshift('\x1B[39m');
    arr.unshift('\x1B[31m' + source);
    /*jslint nomen: true*/
  } else if (this.console.__mozillaConsole__ && source) {
    arr.unshift(source.toUpperCase());
    /*jslint nomen: false*/
  } else if (source) {
    arr.unshift('color: red');
    arr.unshift('%c ' + source);
  }
  if (!this.console[severity] && this.console.log) {
    severity = 'log';
  }
  this.console[severity].apply(this.console, arr);
};

/**
 * Log a message to the console.
 * @param {String} source The source of the message.
 * @param {String} msg The message to log.
 * @method log
 */
Logger_console.prototype.log = function (source, msg, continuation) {
  this.print('log', source, msg);
  continuation();
};

/**
 * Log a message to the console with debug priority.
 * @param {String} source The source of the message.
 * @param {String} msg The message to log.
 * @method log
 */
Logger_console.prototype.debug = function (source, msg, continuation) {
  this.print('debug', source, msg);
  continuation();
};

/**
 * Log a message to the console with info priority.
 * @param {String} source The source of the message.
 * @param {String} msg The message to log.
 * @method log
 */
Logger_console.prototype.info = function (source, msg, continuation) {
  this.print('info', source, msg);
  continuation();
};

/**
 * Log a message to the console with warn priority.
 * @param {String} source The source of the message.
 * @param {String} msg The message to log.
 * @method log
 */
Logger_console.prototype.warn = function (source, msg, continuation) {
  this.print('warn', source, msg);
  continuation();
};

/**
 * Log a message to the console with error priority.
 * @param {String} source The source of the message.
 * @param {String} msg The message to log.
 * @method log
 */
Logger_console.prototype.error = function (source, msg, continuation) {
  this.print('error', source, msg);
  continuation();
};

/** REGISTER PROVIDER **/
fdom.apis.register("core.logger", Logger_console);
