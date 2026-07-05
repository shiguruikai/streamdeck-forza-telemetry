---
type: Guide
title: "Logging"
description: "Logging is a useful way track the flow of functionality, and can assist with diagnosing bugs within your plugin."
resource: "https://docs.elgato.com/streamdeck/sdk/guides/logging"
tags: ['streamdeck', 'sdk', 'logging']
timestamp: "2026-07-05T18:29:48.267537+09:00"
version: "2.0.0"
---

# Logging
Logging is a useful way track the flow of functionality, and can assist with diagnosing bugs within your plugin. By default, the Stream Deck SDK provides support for logging between the runtime consoles, as well as writing logs to the file system.
In this guide you'll learn:
  * How to write log entries using the Stream Deck SDK.
  * Where your plugin's logs are located.
  * Using log levels and logger scopes to help identify logs.


## Writing Logs
Logs are written using a `Logger` instance, with the root logger located on the default `streamDeck` import, for example:
Info level log

```
import streamDeck from "@elgato/streamdeck";

streamDeck.logger.info("Hello world");

streamDeck.connect();
```

tip
It is recommended to use `streamDeck.logger` instead of `console`. Using `streamDeck.logger` ensures your plugin's logs are written to all available targets, for example the LOG file.
## Reading Logs
All logs written to a logger are output to targets based on the source of the log entry, and the plugin's environment, for example whether it is in production or development. The log targets are:  
| Source  | Environment  | Targets  |  
| --- | --- | --- |  
| Plugin  | Development  | 
  * [File](/sdk/guides/logging.md#log-files)
  * [Console (Plugin)](/sdk/guides/logging.md#console)

 |  
| Property Inspector (UI)  | Development  | 
  * [File](/sdk/guides/logging.md#log-files)
  * [Console (Plugin)](/sdk/guides/logging.md#console)
  * [Console (UI)](/sdk/guides/logging.md#console)

 |  
| Plugin  | Production  | 
  * [File](/sdk/guides/logging.md#log-files)

 |  
| Property Inspector (UI)  | Production  | 
  * [File](/sdk/guides/logging.md#log-files)
  * [Console (UI)](/sdk/guides/logging.md#console)

 |  
### Log Files
File logging is provided as standard, allowing for writing logs to LOG files. These LOG files are found within your plugin's `logs` directory, for example:

```
com.elgato.hello-world.sdPlugin/logs/com.elgato.hello-world.0.log
└─────────┬──────────┘               └─────────┬──────────┘ └──┐
     Plugin UUID                          Plugin UUID        Index
```

warning
Uninstalling a plugin will also remove its associated log files. When diagnosing issues, we recommend requesting the logs prior to suggesting a re-install.
#### Format
Logs are written in the following format:

```
<iso_date> <log_level> [[scope]: ]<message>
```

For example:
com.elgato.hello-world.sdPlugin/logs/com.elgato.hello-world.0.log

```
2024-05-05T12:35:13.000Z INFO  Hello world
```

#### File Rotation
The file target also provides automatic file rotation of your plugin's log files, this means that:
  * Your plugin's 10 most recent log files are available, with `0` being the most recent.
  * Log files never exceed 10 MiB.


File rotation occurs, i.e. a new log file is created and the oldest removed, when one of the following occurs:
  * Your plugin starts.
  * The current log file exceeds 10 MiB.


### Console
Whilst developing your plugin, logs are also mirrored to the various consoles supported by the Stream Deck SDK. The supported consoles are:
  * The Node.js terminal when debugging your plugin.
  * The browser console when debugging your property inspectors.


Where available, the console logger maps one-to-one with the native console to provide more insightful messages and familiarity. The mapping is as follows:
Logger vs Console

```
import streamDeck from "@elgato/streamdeck";

// console.error(...)
streamDeck.logger.error("Failures or exceptions");

// console.warn(...)
streamDeck.logger.warn("Recoverable errors");

// console.log(...);
streamDeck.logger.info("Hello world");
streamDeck.logger.debug("Debugging information");
streamDeck.logger.trace("Detailed messages");

streamDeck.connect();
```

## Log Level
Log entries are associated with log levels to assist with indicating their severity. In the previous chapter, you created an `INFO` log entry using:

```
streamDeck.logger.info("Hello world");
```

In addition to `INFO`, it is also possible to create a log with one of the following log levels:
Log levels

```
import streamDeck from "@elgato/streamdeck";

streamDeck.logger.error("Failures or exceptions");
streamDeck.logger.warn("Recoverable errors");
streamDeck.logger.info("Hello world");
streamDeck.logger.debug("Debugging information");
streamDeck.logger.trace("Detailed messages");

streamDeck.connect();
```
  
| Level  | Value  | Description  |  
| --- | --- | --- |  
| Error[](https://docs.elgato.com/streamdeck/sdk/guides/logging/#error "Direct link to Error")  | `LogLevel.ERROR`  | Logs that require immediate attention. For example, module failure, unexpected behavior, or data loss/corruption.  |  
| Warning[](https://docs.elgato.com/streamdeck/sdk/guides/logging/#warning "Direct link to Warning")  | `LogLevel.WARN`  | Represents abnormal behavior, but a recoverable state. For example, a value resorting to a fallback value.  |  
| Information[](https://docs.elgato.com/streamdeck/sdk/guides/logging/#information "Direct link to Information")  | `LogLevel.INFO`  | General information.  |  
| Debug[](https://docs.elgato.com/streamdeck/sdk/guides/logging/#debug "Direct link to Debug")  | `LogLevel.DEBUG`  | Log entries for debugging and development. For example, variable values.  |  
| Trace[](https://docs.elgato.com/streamdeck/sdk/guides/logging/#trace "Direct link to Trace")  | `LogLevel.TRACE`  | Detailed entries for analyzing the context and flow of execution. For example, network traffic, IPC communication. These entries may contain sensitive information.  |  
You can also control _lowest_ level that will be written to the logger, for example if you want to only log error and warning messages, you would do the following:
Setting the log level

```
import streamDeck from "@elgato/streamdeck";

streamDeck.logger.setLevel("warn");

streamDeck.logger.error("Failures or exceptions");
streamDeck.logger.warn("Recoverable errors");
streamDeck.logger.info("Hello world"); // No output.
streamDeck.logger.debug("Debugging information"); // No output.
streamDeck.logger.trace("Detailed messages"); // No output.

streamDeck.connect();
```

warning
The default log level is dependent on the mode of the plugin:
  * Development, the default log level is `DEBUG`.
  * Production, the default log level is `INFO`, with `DEBUG` being the lowest possible level.


## Creating Loggers
Additional child loggers may be created from an existing logger, each of which is called a "scope." A scope can be useful to identify the source of a log message, with the scopes acting as breadcrumbs. For example:
Scoped loggers

```
import streamDeck from "@elgato/streamdeck";

const scopedLogger = streamDeck.logger.createScope("Main");
scopedLogger.info("Hello world");

streamDeck.connect();
```

com.elgato.hello-world.sdPlugin/logs/com.elgato.hello-world.0.log

```
2024-05-05T12:35:13.000Z INFO  Main: Hello world
```

Scoped loggers can also be nested, for example:
Nested scoped loggers

```
import streamDeck from "@elgato/streamdeck";

const scopedLogger = streamDeck.logger.createScope("Main");
scopedLogger.info("Hello world");

const nestedLogger = scopedLogger.createScope("Nested");
nestedLogger.info("Test");

streamDeck.connect();
```

com.elgato.hello-world.sdPlugin/logs/com.elgato.hello-world.0.log

```
2024-05-05T12:35:13.000Z INFO  Main: Hello world
2024-05-05T12:35:13.000Z INFO  Main->Nested: Test
```

## Stream Deck Logs
In addition to the logs written by your plugin, the Stream Deck app also writes logs to help diagnose issues.
  * On Windows, logs are located at `%appdata%\Elgato\StreamDeck\logs\`.
  * On macOS, logs are located at `~/Library/Logs/ElgatoStreamDeck/`.


Stream Deck uses a log rotation in which each run of the app creates a new log file, with the most recent log file being `StreamDeck0.log`.