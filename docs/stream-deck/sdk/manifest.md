---
type: Reference
title: "Manifest"
description: "The manifest JSON file defines your plugin, and provides important metadata that determines how your plugin is executed, and rendered within Stream Deck; thi..."
resource: https://docs.elgato.com/streamdeck/sdk/references/manifest/
tags: [sdk, manifest, configuration]
timestamp: 2026-07-11T20:01:18.327544+09:00
---

# Manifest
The manifest JSON file defines your plugin, and provides important metadata that determines how your plugin is executed, and rendered within Stream Deck; this includes:
  * Your plugin's entry point, aka [CodePath](manifest.md#manifest-codepath).
  * Your [actions](manifest.md#manifest-actions) metadata, such as the name, icon, states etc.
  * Minimum required version of [Stream Deck](manifest.md#manifest-software), and [Node.js](manifest.md#manifest-nodejs).
  * Supported [operating systems](manifest.md#manifest-os).

## Examples
  * Basic
  * Dial support
  * Profiles
  * App monitoring

manifest.json

```
{
    "$schema": "https://schemas.elgato.com/streamdeck/plugins/manifest.json",
    "Actions": [
        {
            "Icon": "action-icon",
            "Name": "Action One",
            "States": [
                {
                    "Image": "state-image"
                }
            ],
            "UUID": "come.elgato.test.one"
        }
    ],
    "Author": "Elgato",
    "CodePath": "bin/plugin.js",
    "Description": "Demo plugin with a minimal manifest.",
    "Icon": "plugin-icon",
    "Name": "Test Plugin",
    "Nodejs": {
        "Version": "20"
    },
    "OS": [
        {
            "Platform": "mac",
            "MinimumVersion": "13"
        },
        {
            "Platform": "windows",
            "MinimumVersion": "10"
        }
    ],
    "UUID": "com.elgato.test",
    "Version": "1.0.0.0",
    "SDKVersion": 2,
    "Software": {
        "MinimumVersion": "6.6"
    }
}
```

manifest.json

```
{
    "$schema": "https://schemas.elgato.com/streamdeck/plugins/manifest.json",
    "Actions": [
        {
            "Icon": "action-icon",
            "Name": "Action With Dial Support",

            "Controllers": ["Keypad", "Encoder"],
            "Encoder": {
                "background": "touchscreen-background",
                "layout": "$B1",
                "TriggerDescription": {
                    "Push": "Play / Pause",
                    "Rotate": "Adjust Volume",
                    "Touch": "Play / Pause",
                    "LongTouch": "Skip Track"
                }
            },
            "States": [
                {
                    "Image": "state-image"
                }
            ],
            "UUID": "come.elgato.test.one"
        }
    ],
    "Author": "Elgato",
    "CodePath": "bin/plugin.js",
    "Description": "Demo plugin with dial support.",
    "Icon": "plugin-icon",
    "Name": "Test Plugin",
    "Nodejs": {
        "Version": "20"
    },
    "OS": [
        {
            "Platform": "mac",
            "MinimumVersion": "13"
        },
        {
            "Platform": "windows",
            "MinimumVersion": "10"
        }
    ],
    "UUID": "com.elgato.test",
    "Version": "1.0.0.0",
    "SDKVersion": 2,
    "Software": {
        "MinimumVersion": "6.6"
    }
}
```

manifest.json

```
{
    "$schema": "https://schemas.elgato.com/streamdeck/plugins/manifest.json",
    "Actions": [
        {
            "Icon": "action-icon",
            "Name": "Action One",
            "States": [
                {
                    "Image": "state-image"
                }
            ],
            "UUID": "come.elgato.test.one"
        }
    ],
    "Author": "Elgato",
    "CodePath": "bin/plugin.js",
    "Description": "Demo plugin with pre-defined profiles.",
    "Icon": "plugin-icon",
    "Name": "Test Plugin",
    "Nodejs": {
        "Version": "20"
    },
    "OS": [
        {
            "Platform": "mac",
            "MinimumVersion": "13"
        },
        {
            "Platform": "windows",
            "MinimumVersion": "10"
        }
    ],

    "Profiles": [
        {
            "DeviceType": 2,
            "DontAutoSwitchWhenInstalled": true,
            "Name": "Custom Profile (SD XL)"
        },
        {
            "DeviceType": 7,
            "DontAutoSwitchWhenInstalled": true,
            "Name": "Custom Profile (SD +)"
        }
    ],
    "UUID": "com.elgato.test",
    "Version": "1.0.0.0",
    "SDKVersion": 2,
    "Software": {
        "MinimumVersion": "6.6"
    }
}
```

manifest.json

```
{
    "$schema": "https://schemas.elgato.com/streamdeck/plugins/manifest.json",
    "Actions": [
        {
            "Icon": "action-icon",
            "Name": "Action One",
            "States": [
                {
                    "Image": "state-image"
                }
            ],
            "UUID": "come.elgato.test.one"
        }
    ],
    "Author": "Elgato",
    "CodePath": "bin/plugin.js",
    "Description": "Demo plugin that monitors applications.",
    "Icon": "plugin-icon",
    "Name": "Test Plugin",
    "Nodejs": {
        "Version": "20"
    },
    "OS": [
        {
            "Platform": "mac",
            "MinimumVersion": "13"
        },
        {
            "Platform": "windows",
            "MinimumVersion": "10"
        }
    ],
    "UUID": "com.elgato.test",
    "Version": "1.0.0.0",
    "SDKVersion": 2,
    "Software": {
        "MinimumVersion": "6.6"
    },

    "ApplicationsToMonitor": {
        "windows": ["my-cool-application.exe"],
        "mac": ["com.test.my-cool-application"]
    }
}
```

## JSON Schema
A JSON schema is available for the manifest JSON file, providing intellisense and validation, and is available at the following URL:
JSON schema URL

```
https://schemas.elgato.com/streamdeck/plugins/manifest.json
```

You can reference this URL using the `$schema` property within your manifest:
Manifest JSON file

```
{
	"$schema": "https://schemas.elgato.com/streamdeck/plugins/manifest.json",
	"Author": "Elgato",
	"Name": "Test Plugin"
	// ...
}
```

## TypeScript Declaration
Manifest TypeScript declaration

```
type Manifest = {
    Actions: {
        Controllers?: ["Encoder" | "Keypad", ("Encoder" | "Keypad")?];
        DisableAutomaticStates?: boolean;
        DisableCaching?: boolean;
        Encoder?: {
            background?: string;
            Icon?: string;
            layout?: `${string}.json` | "$A0" | "$A1" | "$B1" | "$B2" | "$C1" | "$X1";
            StackColor?: string;
            TriggerDescription?: {
                LongTouch?: string;
                Push?: string;
                Rotate?: string;
                Touch?: string;
            };
        };
        Icon: string;
        Name: string;
        OS?: ("mac" | "windows")[];
        PropertyInspectorPath?: `${string}.htm` | `${string}.html`;
        States: {
            FontFamily?: string;
            FontSize?: number;
            FontStyle?: "" | "Bold Italic" | "Bold" | "Italic" | "Regular";
            FontUnderline?: boolean;
            Image: string;
            MultiActionImage?: string;
            Name?: string;
            ShowTitle?: boolean;
            Title?: string;
            TitleAlignment?: "bottom" | "middle" | "top";
            TitleColor?: string;
        }[];
        SupportedInKeyLogicActions?: boolean;
        SupportedInMultiActions?: boolean;
        SupportURL?: string;
        Tooltip?: string;
        UserTitleEnabled?: boolean;
        UUID: string;
        VisibleInActionsList?: boolean;
    }[];
    ApplicationsToMonitor?: {
        mac?: string[];
        windows?: string[];
    };
    Author: string;
    Category?: string;
    CategoryIcon?: string;
    CodePath: string;
    CodePathMac?: string;
    CodePathWin?: string;
    DefaultWindowSize?: [number, number];
    Description: string;
    Icon: string;
    Name: string;
    Nodejs?: {
        Debug?: string;
        GenerateProfilerOutput?: boolean;
        Version: "20" | "24";
    };
    OS: [
        {
            MinimumVersion: string;
            Platform: "mac" | "windows";
        },
        {
            MinimumVersion: string;
            Platform: "mac" | "windows";
        }?,
    ];
    Profiles?: {
        AutoInstall?: boolean;
        DeviceType: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
        DontAutoSwitchWhenInstalled?: boolean;
        Name: string;
        Readonly?: boolean;
    }[];
    PropertyInspectorPath?: `${string}.htm` | `${string}.html`;
    SDKVersion: 2 | 3;
    Software: {
        MinimumVersion: "6.4" | "6.5" | "6.6" | "6.7" | "6.8" | "6.9" | "7.0" | "7.1" | "7.2" | "7.3" | "7.4";
    };
    SupportURL?: string;
    URL?: string;
    UUID: string;
    Version: string;
};
```

File path extensions
Some file path properties within the manifest must have their file extension omitted. For example [Icon](manifest.md#manifest-icon) and a profile's [Name](manifest.md#profile-name) are extension-less file paths, whereas properties such as [CodePath](manifest.md#manifest-codepath) and [PropertyInspectorPath](manifest.md#manifest-propertyinspectorpath) require an extension. For more information, please refer to the documentation of the property.
## Definitions
### Manifest
Defines the plugin and available actions, and all information associated with them, including the plugin's entry point, all iconography, action default behavior, etc.
**Properties**
**Actions** : [Action](manifest.md#action)[]Required
Collection of actions provided by the plugin, and all of their information; this can include actions that are available to users via the actions list, and actions that are hidden to the user but available to pre-defined profiles distributed with the plugin (`Manifest.Actions.VisibleInActionsList`).
**ApplicationsToMonitor** : [ApplicationMonitoring](manifest.md#applicationmonitoring)
Applications to monitor on Mac and Windows; upon a monitored application being launched or terminated, Stream Deck will notify the plugin.
**Also see:**
  * `streamDeck.system.onApplicationDidLaunch(...)`
  * `streamDeck.system.onApplicationDidTerminate(...)`

**Author** : stringRequired
Author's name that will be displayed on the plugin's product page on the Marketplace, e.g. "Elgato".
**Category** : string
Defines the actions list group, providing a natural grouping of the plugin's actions with the Stream Deck application's action list.
Note: `Category` should be distinctive and synonymous with your plugin, and it is therefore recommended that this be the same value as the plugin's `Name` field. When `undefined`, the actions will be available under the "Custom" group.
**CategoryIcon** : string
Path to the image, with the **file extension omitted** , that will be displayed next to the action list group within the Stream Deck application. The icon should accurately represent the plugin, and enable users to quickly identify the plugin.
Image must be:
  * PNG or SVG format.
  * Provided in two sizes, 28 × 28 px and 56 × 56 px (@2x).
  * Monochromatic, with foreground color of #FFFFFF and a transparent background.

**Examples** :
  * assets/category-icon
  * imgs/category

**CodePath** : stringRequired
Path to the plugin's main entry point; this is executed when the Stream Deck application starts the plugin.
**Examples** :
  * index.js
  * Counter
  * Counter.exe

**CodePathMac** : string
Path to the plugin's entry point specific to macOS; this is executed when the Stream Deck application starts the plugin on macOS.
**Examples:**
  * index.js
  * Counter

**CodePathWin** : string
Path to the plugin's entry point specific to Windows; this is executed when the Stream Deck application starts the plugin on Windows.
**Examples:**
  * index.js
  * Counter.exe

**DefaultWindowSize** : [number, number]
Size of a window (`[width, height]`) opened when calling `window.open()` from the property inspector. Default value is `[500, 650]`.
**Description** : stringRequired
Description of the plugin, and the functionality it provides, that will be displayed on the plugin's product page on the Marketplace.
**Icon** : stringRequired
Path to the image, with the **file extension omitted** , that will be displayed within Stream Deck's preferences.
Image must be:
  * PNG format.
  * Provided in two sizes, 256 × 256 px and 512 × 512 px (@2x).

**Examples:**
  * assets/plugin-icon
  * imgs/plugin

**Name** : stringRequired
Name of the plugin, e.g. "Wave Link", "Camera Hub", "Control Center", etc.
**Nodejs** : [Nodejs](manifest.md#nodejs)
Configuration options for Node.js based plugins.
Note: All Node.js plugins are executed with the following command-line arguments:
  * [`--no-addons`](https://nodejs.org/api/cli.html#--no-addons) (Stream Deck 6.4 only)
  * [`--enable-source-maps`](https://nodejs.org/api/cli.html#--enable-source-maps)
  * [`--no-global-search-paths`](https://nodejs.org/api/cli.html#--no-global-search-paths)

**OS** : [[OS](manifest.md#os), [OS](manifest.md#os)?]Required
Collection of operating systems, and their minimum required versions, that the plugin supports.
**Profiles** : [Profile](manifest.md#profile)[]
Collection of pre-defined profiles that are distributed with this plugin. Upon the plugin switching to the profile, the user will be prompted to install the profiles.
Note: Plugins may only switch to profiles distributed with the plugin, as defined within the manifest, and cannot access user-defined profiles.
**Also see:** `streamDeck.profiles.switchToProfile(...)`
**PropertyInspectorPath** : `${string}.htm`, `${string}.html`
Optional path to the HTML file that represents the property inspector for all actions; this is displayed to the user in the Stream Deck application when they add an action, allowing them to configure the action's settings.
Note: Path should be relative to the root of the plugin's folder, with no leading slash.
**Examples:**
  * mute.html
  * actions/join-voice-chat/settings.html

**Also see:**
  * `streamDeck.ui.onSendToPlugin(...)`

**SDKVersion** : 2, 3Required
Preferred SDK version (version 3 is recommended).
**Software** : [Software](manifest.md#software)Required
Determines the Stream Deck software requirements for this plugin.
**SupportURL** : string
Link to the plugin's support website.
**Examples** :
  * <https://help.corsair.com/>
  * <https://help.elgato.com/>

Available from Stream Deck 6.9.
**URL** : string
Link to the plugin's website.
**Examples** :
  * <https://elgato.com>
  * <https://corsair.com>

**UUID** : stringRequired
Unique identifier of the plugin, represented in reverse-DNS format.
**Allowed characters:**
  * Lowercase alphanumeric characters (a-z, 0-9)
  * Hyphens (-)
  * Periods (.)

**Examples:**
  * com.elgato.wavelink
  * com.elgato.discord
  * tv.twitch

**Version** : stringRequired
Version of the plugin, in the format `{major}.{minor}.{patch}.{build}`.
### Action
Provides information about an action provided by the plugin.
**Properties**
**Controllers** : [("Encoder", "Keypad"), ("Encoder", "Keypad")?]
Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2, or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.
**DisableAutomaticStates** : boolean
Determines whether the state of the action should automatically toggle when the user presses the action; only applies to actions that have more than one state defined. Default is `false`.
**DisableCaching** : boolean
Determines whether Stream Deck should cache images associated with the plugin, and its actions. Default is `false`.
**Encoder** : [Encoder](manifest.md#encoder)
Provides information about how the action functions as part of an `Encoder` (dial / touchscreen).
**Icon** : stringRequired
Path to the image, with the **file extension omitted** , that will be displayed next to the action in the Stream Deck application's action list.
Image must be:
  * PNG or SVG format.
  * Provided in two sizes, 20 × 20 px and 40 × 40 px (@2x).
  * Monochromatic, with foreground color of #FFFFFF and a transparent background.

**Examples:**
  * assets/counter
  * imgs/actions/mute

**Name** : stringRequired
Name of the action; this is displayed to the user in the actions list, and is used throughout the Stream Deck application to visually identify the action.
**OS** : ("mac", "windows")[]
Operating system that the action supports.
**PropertyInspectorPath** : `${string}.htm`, `${string}.html`
Optional path to the HTML file that represents the property inspector for this action; this is displayed to the user in the Stream Deck application when they add the action, allowing them to configure the action's settings. When `undefined`, the manifest's top-level `PropertyInspectorPath` is used, otherwise none.
Note: Path should be relative to the root of the plugin's folder, with no leading slash.
**Examples:**
  * mute.html
  * actions/join-voice-chat/settings.html

**States** : [State](manifest.md#state)[]Required
States the action can be in. When two states are defined the action will act as a toggle, with users being able to select their preferred iconography for each state.
Note: Automatic toggling of the state on action activation can be disabled by setting `DisableAutomaticStates` to `true`.
**SupportedInKeyLogicActions** : boolean
Determines whether the action is available to users when they are creating key logic actions. Default is `true`.
Available from Stream Deck 7.0.
**SupportedInMultiActions** : boolean
Determines whether the action is available to users when they are creating multi-actions. Default is `true`.
**SupportURL** : string
Link to the actions's support website.
**Examples** :
  * <https://help.corsair.com/>
  * <https://help.elgato.com/>

Available from Stream Deck 6.9.
**Tooltip** : string
Tooltip shown to the user when they hover over the action within the actions list in the Stream Deck application.
**UUID** : stringRequired
Unique identifier of the action, represented in reverse-DNS format. This value is supplied by Stream Deck when events are emitted that relate to the action enabling you to identify the source of the event.
**Allowed characters:**
  * Lowercase alphanumeric characters (a-z, 0-9)
  * Hyphens (-)
  * Periods (.)

Note: `UUID` must be unique, and should be prefixed with the plugin's UUID.
**Examples:**
  * com.elgato.wavelink.toggle-mute
  * com.elgato.discord.join-voice
  * tv.twitch.go-live

**UserTitleEnabled** : boolean
Determines whether the title field is available to the user when viewing the action's property inspector. Setting this to `false` will disable the user from specifying a title, thus allowing the plugin to have exclusive access to the title. Default is `true`, i.e. the title field is enabled.
**VisibleInActionsList** : boolean
Determines whether the action is available to users via the actions list in the Stream Deck application. Setting this to `false` allows for the action to be used as part of pre-defined profiles distributed with the plugins, whilst not being available to users. Default is `true`.
### ApplicationMonitoring
Applications to monitor on Mac and Windows; upon a monitored application being launched or terminated, Stream Deck will notify the plugin.
**Properties**
**mac** : string[]
Collection of applications to monitor on macOS.
**Examples:**
  * com.apple.mail

**windows** : string[]
Collection of applications to monitor on Windows.
**Examples:**
  * Notepad.exe

### Encoder
Provides information about how the action functions as part of an `Encoder` (dial / touchscreen).
**Properties**
**Icon** : string
Path to the image, with the **file extension omitted** , that will be displayed in the Stream Deck application in the circular canvas that represents the dial of the action.
Image must be:
  * PNG or SVG format.
  * Provided in two sizes, 72 × 72 px and 144 × 144 px (@2x).

Note: Can be overridden by the user in the Stream Deck application.
**Examples:**
  * assets/actions/mute/encoder-icon
  * imgs/join-voice-chat-encoder

**StackColor** : string
Background color to display in the Stream Deck application when the action is part of a dial stack, and is the current action. Represented as a hexadecimal value.
**Examples:**
  * #D60270
  * #F1F1F1
  * #0038A8

**TriggerDescription** : [TriggerDescriptions](manifest.md#triggerdescriptions)
Descriptions that define the interaction of the action when it is associated with a dial / touchscreen on the Stream Deck +. This information is shown to the user.
**Examples:**
  * "Adjust volume"
  * "Play / Pause"

**background** : string
Path to the image, with the **file extension omitted** , that will be displayed on the touchscreen behind the action's layout.
Image must be:
  * PNG or SVG format.
  * Provided in two sizes, 200 × 100 px and 400 × 200 px (@2x).

Note: Can be overridden by the user in the Stream Deck application.
**Examples:**
  * assets/backgrounds/main
  * imgs/bright-blue-bg

**layout** : `${string}.json`, "$A0", "$A1", "$B1", "$B2", "$C1", "$X1"
Name of a pre-defined layout, or the path to a JSON file that details a custom layout and its components, to be rendered on the action's touchscreen canvas.
**Pre-defined Layouts:**
  * `$X1`, layout with the title at the top and the icon beneath it in the center.
  * `$A0`, layout with the title at the top and a full-width image canvas beneath it in the center.
  * `$A1`, layout with the title at the top, the icon on the left, and text value on the right.
  * `$B1`, layout with the title at the top, the icon on the left, and a text value on the right with a progress bar beneath it.
  * `$B2`, layout with the title at the top, the icon on the left, and a text value on the right with a gradient progress bar beneath it.
  * `$C1`, layout with the title at the top, and two rows that display an icon on the left and progress bar on the right (i.e. a double progress bar layout).

**Examples:**
  * $A1
  * layouts/my-custom-layout.json

### Nodejs
Configuration options for Node.js based plugins.
**Properties**
**Debug** : string
Command-line arguments supplied to the plugin when run in debug mode. Optionally, the pre-defined values `"enabled"` and `"break"` run the plugin with a debugger enabled with [`--inspect`](https://nodejs.org/api/cli.html#--inspecthostport) and [`--inspect-brk`](https://nodejs.org/api/cli.html#--inspect-brkhostport) respectively.
Note: `"enabled"` and `"break"` will automatically be assigned an available `PORT` by Stream Deck. Alternatively, if you wish to debug on a pre-defined port, this value can be a set of [command-line arguments](https://nodejs.org/api/cli.html).
**Examples:**
  * `"enabled"` results in `--inspect=127.0.0.1:{PORT}`
  * `"break"` results in `--inspect-brk=127.0.0.1:{PORT}`
  * `"--inspect=127.0.0.1:12345"` runs a local debugger on port `12345`.

**GenerateProfilerOutput** : boolean
Determines whether to generate a profiler output for the plugin; [read more](https://nodejs.org/en/docs/guides/simple-profiling).
**Version** : "20", "24"Required
Version of Node.js to use.
### OS
Operating system that the plugin supports, and the minimum required version needed to run the plugin.
**Properties**
**MinimumVersion** : stringRequired
Minimum version required of the operating system to run the plugin.
**Platform** : "mac", "windows"Required
Operating system supported by the plugin.
### Profile
Provides information for pre-defined profile distributed with this plugin.
**Properties**
**AutoInstall** : boolean
Determines whether the profile should be automatically installed when the plugin is installed. When `false`, the profile will be installed the first time the plugin attempts to switch to it. Default is `true`.
Available from Stream Deck 6.6.
**DeviceType** : 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13Required
Type of device the profile is intended for, for example Stream Deck +, Stream Deck Pedal, etc.
**Devices**
  * Stream Deck (0)
  * Stream Deck Mini (1)
  * Stream Deck XL (2)
  * Stream Deck Mobile (3)
  * Corsair GKeys (4)
  * Stream Deck Pedal (5)
  * Corsair Voyager (6)
  * Stream Deck + (7)
  * SCUF Controller (8)
  * Stream Deck Neo (9)
  * Stream Deck Studio (10)
  * Virtual Stream Deck (11)
  * Galleon 100 SD (12)
  * Stream Deck + XL (13)

**DontAutoSwitchWhenInstalled** : boolean
Determines whether the Stream Deck application should automatically switch to the profile when it is first installed. Default value is `false`.
**Name** : stringRequired
Path to the `.streamDeckProfile`, with the **file extension omitted** , that contains the profiles layout and action settings.
**Examples:**
  * assets/main-profile
  * profiles/super-cool-profile

**Readonly** : boolean
Determines whether the profile is read-only, or if the user is able to customize it within the Stream Deck application. Default value is `false`.
### Software
Determines the Stream Deck software requirements for this plugin.
**Properties**
**MinimumVersion** : "6.4", "6.5", "6.6", "6.7", "6.8", "6.9", "7.0", "7.1", "7.2", "7.3", "7.4"Required
Minimum version of the Stream Deck application required for this plugin to run.
### State
States the action can be in. When two states are defined the action will act as a toggle, with users being able to select their preferred iconography for each state.
Note: Automatic toggling of the state on action activation can be disabled by setting `DisableAutomaticStates` to `true`.
**Properties**
**FontFamily** : string
Default font-family to be used when rendering the title of this state.
Note: Can be overridden by the user in the Stream Deck application.
**FontSize** : number
Default font-size to be used when rendering the title of this state.
Note: Can be overridden by the user in the Stream Deck application.
**FontStyle** : "", "Bold Italic", "Bold", "Italic", "Regular"
Default font-style to be used when rendering the title of this state.
Note: Can be overridden by the user in the Stream Deck application.
**FontUnderline** : boolean
Determines whether the title associated with this state is underlined by default.
Note: Can be overridden by the user in the Stream Deck application.
**Image** : stringRequired
Path to the image, with the **file extension omitted** , that will be displayed on the Stream Deck when this action's state is active.
Image must be:
  * GIF, PNG or SVG format.
  * Provided in two sizes, 72 × 72 px and 144 × 144 px (@2x).

Note: Can be overridden by the user in the Stream Deck application.
**Examples:**
  * assets/counter-key
  * assets/icons/mute

**MultiActionImage** : string
Path to the image, with the **file extension omitted** , that will be displayed when the action is being viewed as part of a multi-action.
Image must be:
  * PNG or SVG format.
  * Provided in two sizes, 72 × 72 px and 144 × 144 px (@2x).

Note: Can be overridden by the user in the Stream Deck application.
**Examples:**
  * assets/counter-key
  * assets/icons/mute

**Name** : string
Name of the state; when multiple states are defined this value is shown to the user when the action is being added to a multi-action. The user is then able to specify which state they would like to activate as part of the multi-action.
**ShowTitle** : boolean
Determines whether the title should be shown.
Note: Can be overridden by the user in the Stream Deck application.
**Title** : string
Default title to be shown when the action is added to the Stream Deck.
**TitleAlignment** : "bottom", "middle", "top"
Default title alignment to be used when rendering the title of this state.
Note: Can be overridden by the user in the Stream Deck application.
**TitleColor** : string
Default title color to be used when rendering the title of this state, represented a hexadecimal value.
Note: Can be overridden by the user in the Stream Deck application.
**Examples:**
  * #5BCEFA
  * #F5A9B8
  * #FFFFFF

### TriggerDescriptions
Descriptions that define the interaction of the action when it is associated with a dial / touchscreen on the Stream Deck +. This information is shown to the user.
**Examples:**
  * "Adjust volume"
  * "Play / Pause"

**Properties**
**LongTouch** : string
Touchscreen "long-touch" interaction behavior description.
**Push** : string
Dial "push" (press) interaction behavior description.
**Rotate** : string
Dial rotation interaction behavior description.
**Touch** : string
Touchscreen "touch" interaction behavior description.
