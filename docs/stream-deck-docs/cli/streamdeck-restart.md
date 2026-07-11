---
type: Reference
title: "streamdeck restart"
description: "Restarts the Stream Deck plugin."
resource: https://docs.elgato.com/streamdeck/cli/commands/restart/
tags: [cli, commands, restart]
timestamp: 2026-07-11T20:01:18.292128+09:00
---

# streamdeck restart
Restarts the Stream Deck plugin.
## Synopsis

```
streamdeck restart <uuid>
```

## Description
Instructs Stream Deck to restart (stop and then start) the Stream Deck plugin, identified by the plugin's UUID. If the plugin is not already running, Stream Deck will start it.
Restarting the plugin will result in all resources associated with the plugin, including the manifest JSON file, being reloaded.
## Examples
Restart plugin with UUID `com.elgato.hello-world`.
Terminal

```
streamdeck restart com.elgato.hello-world
```

## See Also
  * [streamdeck stop](streamdeck-stop.md)
