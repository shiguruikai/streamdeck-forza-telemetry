---
type: Reference
title: "streamdeck link"
description: "Link (install) the plugin to Stream Deck."
resource: https://docs.elgato.com/streamdeck/cli/commands/link/
tags: [cli, commands, link]
timestamp: 2026-07-11T20:01:18.290048+09:00
---

# streamdeck link
Link (install) the plugin to Stream Deck.
## Synopsis

```
streamdeck link <path>
```

## Description
Links the specified directory to Stream Deck, effectively installing the plugin, allowing it to be accessed from within Stream Deck. When the path is unspecified, the current working directory is used.
Directory name
The directory name must reflect the UUID of your plugin and be suffixed with `.sdPlugin`. For example, a plugin with the UUID `com.elgato.hello-world` must be located in a directory named `com.elgato.hello-world.sdPlugin/`.
## Examples
Link the current working directory:
Terminal

```
streamdeck link
```

Link the directory, `com.elgato.hello-world.sdPlugin`:
Terminal

```
streamdeck link com.elgato.hello-world.sdPlugin
```

## See Also
  * [streamdeck unlink](streamdeck-unlink.md)
