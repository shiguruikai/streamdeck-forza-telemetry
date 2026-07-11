---
type: Guide
title: "Property Inspectors (UI)"
description: "Property inspectors are HTML web views that provide users with an interface to adjust plugin settings. Work in progress The property inspector and its docume..."
resource: https://docs.elgato.com/streamdeck/sdk/guides/ui/
tags: [sdk, ui, property-inspector]
timestamp: 2026-07-11T20:01:18.317964+09:00
---

# Property Inspectors (UI)
Property inspectors are HTML web views that provide users with an interface to adjust plugin settings.
Work in progress
The property inspector and its documentation are still in development. The information provided here is subject to change.
## Getting Started
Start by creating an HTML file in your `ui` directory within `*.sdPlugin`.
Plugin file structure

```
.
├── *.sdPlugin/
│   ├── bin/
│   ├── imgs/
│   ├── logs/
│   ├── ui/
│   │   └── increment-counter.html
│   └── manifest.json
├── src/
│   ├── actions/
│   │   └── increment-counter.ts
│   └── plugin.ts
├── package.json
├── rollup.config.mjs
└── tsconfig.json
```

Add the path to your property inspector HTML file in the action's `PropertyInspectorPath` property of your manifest file.
Manifest with a property inspector at the action level

```
{
    "$schema": "https://schemas.elgato.com/streamdeck/plugins/manifest.json",
    "Name": "Counter",
    "Version": "1.0.0.0",
    "Actions": [
        {
            "Name": "Counter",
            "UUID": "com.elgato.hello-world.increment",
            "PropertyInspectorPath": "ui/increment-counter.html"
            // ...
        }
    ]
    // ...
}
```

There can also be a property inspector declared at the plugin level that will appear for any actions that do not explicitly declare a `PropertyInspectorPath`.
Manifest with a property inspector at the plugin level

```
{
    "$schema": "https://schemas.elgato.com/streamdeck/plugins/manifest.json",
    "Name": "Counter",
    "Version": "1.0.0.0",
    "PropertyInspectorPath": "increment-counter.html", 
    "Actions": [
        {
            "Name": "Counter",
            "UUID": "ui/com.elgato.hello-world.increment"
            // ...
        }
    ]
    // ...
}
```

## UI Library
The Stream Deck UI library, called sdpi-components (Stream Deck Property Inspector Components), is designed to streamline building property inspectors. The UI library enables communication with your plugin from the property inspector, as well as providing a collection of web components for building consistent and user-friendly interfaces.
To use the UI library, you will need to reference it in one of the following ways.
  * Local (recommended)
  * Remote

Referencing the UI library locally ensures a consistent and predictable experience for users, and where applicable allows your plugin to work without an internet connection.
To reference the UI library locally, download [sdpi-components.js](https://sdpi-components.dev/releases/v4/sdpi-components.js) alongside your local HTML file, and reference the file within your property inspector.
Property inspector HTML

```
<!doctype html>
<html>

<head lang="en">
    <meta charset="utf-8" />

    <script src="sdpi-components.js"></script>
</head>

<body>
    <sdpi-item label="Name">
        <sdpi-textfield setting="name"></sdpi-textfield>
    </sdpi-item>
</body>

</html>
```

Referencing the UI library from the remote CDN is no longer recommended, however it can still be useful for quick iterative development or prototyping. When distributing your plugin, you should always reference the UI library locally.
To reference the UI library remotely, add a reference to [sdpi-components.js](https://sdpi-components.dev/releases/v4/sdpi-components.js) within your property inspector.
Property inspector HTML

```
<!doctype html>
<html>

<head lang="en">
    <meta charset="utf-8" />

    <script src="https://sdpi-components.dev/releases/v4/sdpi-components.js"></script>
</head>

<body>
    <sdpi-item label="Name">
        <sdpi-textfield setting="name"></sdpi-textfield>
    </sdpi-item>
</body>

</html>
```

### Components
The following components are available as part of the sdpi-components UI library.  
| Component  | sdpi-component  |  
| --- | --- |  
| [Button](../sdpi-components/components/button.md)  | `<sdpi-button>`  |  
| [Checkbox](../sdpi-components/components/checkbox.md)  | `<sdpi-checkbox>`  |  
| [Checkbox List](../sdpi-components/components/checkbox-list.md)  | `<sdpi-checkbox-list>`  |  
| [Color](../sdpi-components/components/color.md)  | `<sdpi-color>`  |  
| [Date](../sdpi-components/components/date.md)  | `<sdpi-calendar type="date">`  |  
| [Datetime (Local)](../sdpi-components/components/datetime-local.md)  | `<sdpi-calendar type="datetime-local">`  |  
| [Delegate](../sdpi-components/components/delegate.md)  | `<sdpi-delegate>`  |  
| [File](../sdpi-components/components/file.md)  | `<sdpi-file>`  |  
| [Month](../sdpi-components/components/month.md)  | `<sdpi-calendar type="month">`  |  
| [Password](../sdpi-components/components/password.md)  | `<sdpi-password>`  |  
| [Radio](../sdpi-components/components/radio.md)  | `<sdpi-radio>`  |  
| [Range](../sdpi-components/components/range.md)  | `<sdpi-range>`  |  
| [Select](../sdpi-components/components/select.md)  | `<sdpi-select>`  |  
| [Textarea](../sdpi-components/components/textarea.md)  | `<sdpi-textarea>`  |  
| [Textfield](../sdpi-components/components/textfield.md)  | `<sdpi-textfield>`  |  
| [Time](../sdpi-components/components/time.md)  | `<sdpi-calendar type="time">`  |  
| [Week](../sdpi-components/components/week.md)  | `<sdpi-calendar type="week">`  |  
### Stream Deck Client
The [Stream Deck Client](../sdpi-components/stream-deck-client.md) allows the property inspector to communicate directly with the plugin. Once you've included the `sdpi-components.js` script tag in the property inspector's HTML file, you can reference `streamDeckClient` from the `SDPIComponents` namespace.
  * Local (recommended)
  * Remote

Property inspector HTML

```
<!doctype html>
<html>

<head lang="en">
    <meta charset="utf-8" />

    <script src="sdpi-components.js"></script>
</head>

<body>

    <script>
        const { streamDeckClient } = SDPIComponents;

        streamDeckClient.setSettings({
            name: "John Doe",
            showName: true,
            favColor: "green",
        });
    </script>
</body>

</html>
```

Property inspector HTML

```
<!doctype html>
<html>

<head lang="en">
    <meta charset="utf-8" />

    <script src="https://sdpi-components.dev/releases/v4/sdpi-components.js"></script>
</head>

<body>

    <script>
        const { streamDeckClient } = SDPIComponents;

        streamDeckClient.setSettings({
            name: "John Doe",
            showName: true,
            favColor: "green",
        });
    </script>
</body>

</html>
```

## Debugging
To debug the property inspector, [developer mode](../cli/streamdeck-dev.md) must be enabled. Developer mode is enabled by default when the CLI tool's [`create`](../cli/streamdeck-create.md) command runs, but can also be enabled directly with the [`dev`](../cli/streamdeck-dev.md) command.
Terminal

```
streamdeck dev
```

Once enabled, the remote debugger will be available at [`http://localhost:23654/`](http://localhost:23654/) with a list of available pages. Select the property inspector's page to debug using the browser's built-in web development tools. In most browsers these tools can be accessed by pressing `F12` or the `inspect` option in the context menu.
Open the property inspector
The property inspector must be visible within Stream Deck for the page to appear in the list of pages availabe for debug.
Utilizing the `didReceiveSettings` event within the plugin's action may also be useful for debugging settings and the property inspector.
Receive settings callback

```
import streamDeck, { action, type DidReceiveSettingsEvent, SingletonAction } from "@elgato/streamdeck";

// Define the action's settings type.
type Settings = {
	count: number;
};

@action({ UUID: "com.elgato.hello-world.counter" })
class Counter extends SingletonAction<Settings> {
	/**
	 * Occurs when the application-layer receives the settings from the UI.
	 */

	override onDidReceiveSettings(ev: DidReceiveSettingsEvent<Settings>): void {
		// Handle the settings changing in the property inspector (UI).
	}
}

streamDeck.actions.registerAction(new Counter());
streamDeck.connect();
```
