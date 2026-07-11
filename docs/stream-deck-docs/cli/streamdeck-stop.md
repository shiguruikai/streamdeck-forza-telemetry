---
type: Reference
title: "streamdeck stop"
description: "Stops the Stream Deck plugin."
resource: https://docs.elgato.com/streamdeck/cli/commands/stop/
tags: [cli, commands, stop]
timestamp: 2026-07-11T20:01:18.292740+09:00
---

# streamdeck stop
Stops the Stream Deck plugin.
## Synopsis

```
streamdeck stop <uuid>

alias: s
```

## Description
Instructs Stream Deck to stop the plugin, as identified by the plugin's UUID. When stopped, the plugin and all of its resources are unloaded from Stream Deck allowing the plugin to be changed.
## Examples
Stop the plugin with UUID `com.elgato.hello-world`:
Terminal

```
streamdeck stop com.elgato.hello-world
```

## See Also
  * [streamdeck restart](streamdeck-restart.md)
