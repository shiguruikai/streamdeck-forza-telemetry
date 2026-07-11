---
type: Reference
title: "streamdeck pack"
description: "Packages a Stream Deck plugin into a distributable installation file."
resource: https://docs.elgato.com/streamdeck/cli/commands/pack/
tags: [cli, commands, pack]
timestamp: 2026-07-11T20:01:18.291450+09:00
---

# streamdeck pack
Packages a Stream Deck plugin into a distributable installation file.
## Synopsis

```
streamdeck pack [options] [path]

Arguments:
  path                  Path of the plugin to pack

Options:
  --dry-run             "Generates a report without creating a package (default: false)"
  -f|--force            "Forces saving, overwriting an package if it exists (default: false)"
  -o|--output <output>  "Specifies the path for the output directory"
  --version <version>   "Plugin version; value will be written to the manifest"
  --force-update-check  "Forces an update check (default: false)"
  --no-update-check     "Disables updating schemas"

alias: bundle
```

## Description
Creates a `.streamDeckPlugin` installer file allowing your plugin to be distributed. The plugin must pass [validation](streamdeck-validate.md) prior to bundling.
By default, all files within the specified `path` are included except `.git`, `/.env*`, `*.log`, and `*.js.map` directories and files. To specify directories or files that should be ignored, a `.sdignore` file can be created in the root of the plugin, i.e. alongside the manifest, using [`.gitignore` specification](https://git-scm.com/docs/gitignore).
## Examples
Create a `.streamDeckPlugin` file of the plugin located in `com.elgato.test.sdPlugin/`, writing the packaged file to a `dist/` folder:
Terminal

```
streamdeck pack com.elgato.test.sdPlugin/ --output dist/
```

Create a `.streamDeckPlugin` file of the current working directory, specifying a new version of the plugin.
Terminal

```
streamdeck pack --version "0.8.2.12"
```

Generate a report of packaging the plugin in the current working directory, without creating a `.streamDeckPlugin` file.
Terminal

```
streamdeck pack --dry-run
```

## Configuration
####  `--dry-run`
  * Default: `false`
  * Type: Boolean

Generates a report without creating a package.
####  `-f|--force`
  * Default: `false`
  * Type: Boolean

Determines whether to overwrite the existing `.streamDeckPlugin` file if one already exists at the specified `output` directory.
####  `--force-update-check`
  * Default: `false`
  * Type: Boolean

Forces an update check of new validation rules; by default, an update check will occur once a day. Cannot be used in conjunction with `--no-update-check`.
####  `--no-update-check`
  * Default: `false`
  * Type: Boolean

Prevents an update check of new validation rules. This configuration option is recommended when using the CLI as part of a build pipeline. Cannot be used in conjunction with `--force-update-check`.
####  `-o|--output <output>`
  * Default: `cwd`
  * Type: String

Specifies the path for the output directory where the `.streamDeckPlugin` file will be created.
####  `--version <version>`
  * Default: `undefined`
  * Type: String (semver)

Plugin version; value will be written to the manifest's `Version` property prior to packaging the plugin.
## See also
  * [streamdeck validate](streamdeck-validate.md)
