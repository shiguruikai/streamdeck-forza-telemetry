---
type: Reference
title: "streamdeck unlink"
description: "Unlinks the plugin from Stream Deck."
resource: https://docs.elgato.com/streamdeck/cli/commands/unlink/
tags: [cli, commands, unlink]
timestamp: 2026-07-11T20:01:18.293308+09:00
---

# streamdeck unlink
Unlinks the plugin from Stream Deck.
## Synopsis

```
streamdeck unlink [options] <uuid>

Arguments
  uuid         Plugin to unlink

Options:
  -d|--delete  Enable deletion of non-linked plugins
```

## Description
Unlinks the linked (developer) plugin from Stream Deck, effectively uninstalling it. The plugin's original source directory remains unaffected.
Available from version 1.5.0.
## Examples
Unlink a plugin with the UUID `com.elgato.hello-world`.
Terminal

```
streamdeck unlink com.elgato.hello-world
```

## Configuration
####  `-d|--delete`
  * Default: `false`
  * Type: Boolean

Enables the removal of plugins that are not linked plugins, i.e. those installed regularly. When `true` and the plugin is not a linked plugin, the plugin is deleted.
## See Also
  * [streamdeck link](streamdeck-link.md)
