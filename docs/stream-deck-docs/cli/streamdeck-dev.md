---
type: Reference
title: "streamdeck dev"
description: "Controls developer mode."
resource: https://docs.elgato.com/streamdeck/cli/commands/dev/
tags: [cli, commands, dev]
timestamp: 2026-07-11T20:01:18.289444+09:00
---

# streamdeck dev
Controls developer mode.
## Synopsis

```
streamdeck dev [-d|--disable]
```

## Description
Developer mode enables the local development of Stream Deck plugins, and provides you with additional capabilities for building and debugging plugin with Stream Deck.
Whilst enabled:
  * Debuggers, for example VS Code, can be attached to Node.js plugins.
  * The property inspector can be debugged locally at <http://localhost:23654/>.

## Examples
Enable developer mode:
Terminal

```
streamdeck dev
```

Disable developer mode:
Terminal

```
streamdeck dev --disable
```

## Configuration
####  `--disable`
  * Default: `false`
  * Type: Boolean

Disables developer mode.
