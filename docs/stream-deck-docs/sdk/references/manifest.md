---
type: Reference
title: "Manifest"
description: "The manifest JSON file defines your plugin, and provides important metadata that determines how your plugin is executed, and rendered within Stream De"
resource: "https://docs.elgato.com/streamdeck/sdk/references/manifest"
tags: ['streamdeck', 'sdk', 'manifest']
timestamp: "2026-07-05T18:29:48.267537+09:00"
version: "2.0.0"
---

# Manifest
The manifest JSON file defines your plugin, and provides important metadata that determines how your plugin is executed, and rendered within Stream Deck; this includes:
  * Your plugin's entry point, aka [CodePath](/sdk/references/manifest.md#manifest-codepath).
  * Your [actions](/sdk/references/manifest.md#manifest-actions) metadata, such as the name, icon, states etc.
  * Minimum required version of [Stream Deck](/sdk/references/manifest.md#manifest-software), and [Node.js](/sdk/references/manifest.md#manifest-nodejs).
  * Supported [operating systems](/sdk/references/manifest.md#manifest-os).


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
Some file path properties within the manifest must have their file extension omitted. For example [Icon](/sdk/references/manifest.md#manifest-icon) and a profile's [Name](/sdk/references/manifest.md#profile-name) are extension-less file paths, whereas properties such as [CodePath](/sdk/references/manifest.md#manifest-codepath) and [PropertyInspectorPath](/sdk/references/manifest.md#manifest-propertyinspectorpath) require an extension. For more information, please refer to the documentation of the property.
## Definitions
### Manifest
Defines the plugin and available actions, and all information associated with them, including the plugin's entry point, all iconography, action default behavior, etc.
**Properties**
**Actions** : [Action](/sdk/references/manifest.md#action)[][](https://docs.elgato.com/streamdeck/sdk/references/manifest/#manifest-actions "Direct link to Actions")Required
Collection of actions provided by the plugin, and all of their information; this can include actions that are available to users via the actions list, and actions that are hidden to the user but available to pre-defined profiles distributed with the plugin (`Manifest.Actions.VisibleInActionsList`).
**ApplicationsToMonitor** : [ApplicationMonitoring](/sdk/references/manifest.md#applicationmonitoring)[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#manifest-applicationstomonitor "Direct link to ApplicationsToMonitor")
Applications to monitor on Mac and Windows; upon a monitored application being launched or terminated, Stream Deck will notify the plugin.
**Also see:**
  * `streamDeck.system.onApplicationDidLaunch(...)`
  * `streamDeck.system.onApplicationDidTerminate(...)`


**Author** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#manifest-author "Direct link to Author")Required
Author's name that will be displayed on the plugin's product page on the Marketplace, e.g. "Elgato".
**Category** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#manifest-category "Direct link to Category")
Defines the actions list group, providing a natural grouping of the plugin's actions with the Stream Deck application's action list.
Note: `Category` should be distinctive and synonymous with your plugin, and it is therefore recommended that this be the same value as the plugin's `Name` field. When `undefined`, the actions will be available under the "Custom" group.
**CategoryIcon** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#manifest-categoryicon "Direct link to CategoryIcon")
Path to the image, with the **file extension omitted** , that will be displayed next to the action list group within the Stream Deck application. The icon should accurately represent the plugin, and enable users to quickly identify the plugin.
Image must be:
  * PNG or SVG format.
  * Provided in two sizes, 28 × 28 px and 56 × 56 px (@2x).
  * Monochromatic, with foreground color of #FFFFFF and a transparent background.


**Examples** :
  * assets/category-icon
  * imgs/category


**CodePath** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#manifest-codepath "Direct link to CodePath")Required
Path to the plugin's main entry point; this is executed when the Stream Deck application starts the plugin.
**Examples** :
  * index.js
  * Counter
  * Counter.exe


**CodePathMac** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#manifest-codepathmac "Direct link to CodePathMac")
Path to the plugin's entry point specific to macOS; this is executed when the Stream Deck application starts the plugin on macOS.
**Examples:**
  * index.js
  * Counter


**CodePathWin** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#manifest-codepathwin "Direct link to CodePathWin")
Path to the plugin's entry point specific to Windows; this is executed when the Stream Deck application starts the plugin on Windows.
**Examples:**
  * index.js
  * Counter.exe


**DefaultWindowSize** : [number, number][](https://docs.elgato.com/streamdeck/sdk/references/manifest/#manifest-defaultwindowsize "Direct link to DefaultWindowSize")
Size of a window (`[width, height]`) opened when calling `window.open()` from the property inspector. Default value is `[500, 650]`.
**Description** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#manifest-description "Direct link to Description")Required
Description of the plugin, and the functionality it provides, that will be displayed on the plugin's product page on the Marketplace.
**Icon** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#manifest-icon "Direct link to Icon")Required
Path to the image, with the **file extension omitted** , that will be displayed within Stream Deck's preferences.
Image must be:
  * PNG format.
  * Provided in two sizes, 256 × 256 px and 512 × 512 px (@2x).


**Examples:**
  * assets/plugin-icon
  * imgs/plugin


**Name** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#manifest-name "Direct link to Name")Required
Name of the plugin, e.g. "Wave Link", "Camera Hub", "Control Center", etc.
**Nodejs** : [Nodejs](/sdk/references/manifest.md#nodejs)[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#manifest-nodejs "Direct link to Nodejs")
Configuration options for Node.js based plugins.
Note: All Node.js plugins are executed with the following command-line arguments:
  * [`--no-addons`](https://nodejs.org/api/cli.html#--no-addons) (Stream Deck 6.4 only)
  * [`--enable-source-maps`](https://nodejs.org/api/cli.html#--enable-source-maps)
  * [`--no-global-search-paths`](https://nodejs.org/api/cli.html#--no-global-search-paths)


**OS** : [[OS](/sdk/references/manifest.md#os), [OS](/sdk/references/manifest.md#os)?][](https://docs.elgato.com/streamdeck/sdk/references/manifest/#manifest-os "Direct link to OS")Required
Collection of operating systems, and their minimum required versions, that the plugin supports.
**Profiles** : [Profile](/sdk/references/manifest.md#profile)[][](https://docs.elgato.com/streamdeck/sdk/references/manifest/#manifest-profiles "Direct link to Profiles")
Collection of pre-defined profiles that are distributed with this plugin. Upon the plugin switching to the profile, the user will be prompted to install the profiles.
Note: Plugins may only switch to profiles distributed with the plugin, as defined within the manifest, and cannot access user-defined profiles.
**Also see:** `streamDeck.profiles.switchToProfile(...)`
**PropertyInspectorPath** : `${string}.htm`, `${string}.html`[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#manifest-propertyinspectorpath "Direct link to PropertyInspectorPath")
Optional path to the HTML file that represents the property inspector for all actions; this is displayed to the user in the Stream Deck application when they add an action, allowing them to configure the action's settings.
Note: Path should be relative to the root of the plugin's folder, with no leading slash.
**Examples:**
  * mute.html
  * actions/join-voice-chat/settings.html


**Also see:**
  * `streamDeck.ui.onSendToPlugin(...)`


**SDKVersion** : 2, 3[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#manifest-sdkversion "Direct link to SDKVersion")Required
Preferred SDK version (version 3 is recommended).
**Software** : [Software](/sdk/references/manifest.md#software)[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#manifest-software "Direct link to Software")Required
Determines the Stream Deck software requirements for this plugin.
**SupportURL** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#manifest-supporturl "Direct link to SupportURL")
Link to the plugin's support website.
**Examples** :
  * <https://help.corsair.com/>
  * <https://help.elgato.com/>


Available from Stream Deck 6.9.
**URL** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#manifest-url "Direct link to URL")
Link to the plugin's website.
**Examples** :
  * <https://elgato.com>
  * <https://corsair.com>


**UUID** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#manifest-uuid "Direct link to UUID")Required
Unique identifier of the plugin, represented in reverse-DNS format.
**Allowed characters:**
  * Lowercase alphanumeric characters (a-z, 0-9)
  * Hyphens (-)
  * Periods (.)


**Examples:**
  * com.elgato.wavelink
  * com.elgato.discord
  * tv.twitch


**Version** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#manifest-version "Direct link to Version")Required
Version of the plugin, in the format `{major}.{minor}.{patch}.{build}`.
### Action
Provides information about an action provided by the plugin.
**Properties**
**Controllers** : [("Encoder", "Keypad"), ("Encoder", "Keypad")?][](https://docs.elgato.com/streamdeck/sdk/references/manifest/#action-controllers "Direct link to Controllers")
Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2, or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.
**DisableAutomaticStates** : boolean[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#action-disableautomaticstates "Direct link to DisableAutomaticStates")
Determines whether the state of the action should automatically toggle when the user presses the action; only applies to actions that have more than one state defined. Default is `false`.
**DisableCaching** : boolean[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#action-disablecaching "Direct link to DisableCaching")
Determines whether Stream Deck should cache images associated with the plugin, and its actions. Default is `false`.
**Encoder** : [Encoder](/sdk/references/manifest.md#encoder)[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#action-encoder "Direct link to Encoder")
Provides information about how the action functions as part of an `Encoder` (dial / touchscreen).
**Icon** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#action-icon "Direct link to Icon")Required
Path to the image, with the **file extension omitted** , that will be displayed next to the action in the Stream Deck application's action list.
Image must be:
  * PNG or SVG format.
  * Provided in two sizes, 20 × 20 px and 40 × 40 px (@2x).
  * Monochromatic, with foreground color of #FFFFFF and a transparent background.


**Examples:**
  * assets/counter
  * imgs/actions/mute


**Name** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#action-name "Direct link to Name")Required
Name of the action; this is displayed to the user in the actions list, and is used throughout the Stream Deck application to visually identify the action.
**OS** : ("mac", "windows")[][](https://docs.elgato.com/streamdeck/sdk/references/manifest/#action-os "Direct link to OS")
Operating system that the action supports.
**PropertyInspectorPath** : `${string}.htm`, `${string}.html`[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#action-propertyinspectorpath "Direct link to PropertyInspectorPath")
Optional path to the HTML file that represents the property inspector for this action; this is displayed to the user in the Stream Deck application when they add the action, allowing them to configure the action's settings. When `undefined`, the manifest's top-level `PropertyInspectorPath` is used, otherwise none.
Note: Path should be relative to the root of the plugin's folder, with no leading slash.
**Examples:**
  * mute.html
  * actions/join-voice-chat/settings.html


**States** : [State](/sdk/references/manifest.md#state)[][](https://docs.elgato.com/streamdeck/sdk/references/manifest/#action-states "Direct link to States")Required
States the action can be in. When two states are defined the action will act as a toggle, with users being able to select their preferred iconography for each state.
Note: Automatic toggling of the state on action activation can be disabled by setting `DisableAutomaticStates` to `true`.
**SupportedInKeyLogicActions** : boolean[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#action-supportedinkeylogicactions "Direct link to SupportedInKeyLogicActions")
Determines whether the action is available to users when they are creating key logic actions. Default is `true`.
Available from Stream Deck 7.0.
**SupportedInMultiActions** : boolean[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#action-supportedinmultiactions "Direct link to SupportedInMultiActions")
Determines whether the action is available to users when they are creating multi-actions. Default is `true`.
**SupportURL** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#action-supporturl "Direct link to SupportURL")
Link to the actions's support website.
**Examples** :
  * <https://help.corsair.com/>
  * <https://help.elgato.com/>


Available from Stream Deck 6.9.
**Tooltip** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#action-tooltip "Direct link to Tooltip")
Tooltip shown to the user when they hover over the action within the actions list in the Stream Deck application.
**UUID** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#action-uuid "Direct link to UUID")Required
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


**UserTitleEnabled** : boolean[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#action-usertitleenabled "Direct link to UserTitleEnabled")
Determines whether the title field is available to the user when viewing the action's property inspector. Setting this to `false` will disable the user from specifying a title, thus allowing the plugin to have exclusive access to the title. Default is `true`, i.e. the title field is enabled.
**VisibleInActionsList** : boolean[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#action-visibleinactionslist "Direct link to VisibleInActionsList")
Determines whether the action is available to users via the actions list in the Stream Deck application. Setting this to `false` allows for the action to be used as part of pre-defined profiles distributed with the plugins, whilst not being available to users. Default is `true`.
### ApplicationMonitoring
Applications to monitor on Mac and Windows; upon a monitored application being launched or terminated, Stream Deck will notify the plugin.
**Properties**
**mac** : string[][](https://docs.elgato.com/streamdeck/sdk/references/manifest/#applicationmonitoring-mac "Direct link to mac")
Collection of applications to monitor on macOS.
**Examples:**
  * com.apple.mail


**windows** : string[][](https://docs.elgato.com/streamdeck/sdk/references/manifest/#applicationmonitoring-windows "Direct link to windows")
Collection of applications to monitor on Windows.
**Examples:**
  * Notepad.exe


### Encoder
Provides information about how the action functions as part of an `Encoder` (dial / touchscreen).
**Properties**
**Icon** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#encoder-icon "Direct link to Icon")
Path to the image, with the **file extension omitted** , that will be displayed in the Stream Deck application in the circular canvas that represents the dial of the action.
Image must be:
  * PNG or SVG format.
  * Provided in two sizes, 72 × 72 px and 144 × 144 px (@2x).


Note: Can be overridden by the user in the Stream Deck application.
**Examples:**
  * assets/actions/mute/encoder-icon
  * imgs/join-voice-chat-encoder


**StackColor** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#encoder-stackcolor "Direct link to StackColor")
Background color to display in the Stream Deck application when the action is part of a dial stack, and is the current action. Represented as a hexadecimal value.
**Examples:**
  * #D60270
  * #F1F1F1
  * #0038A8


**TriggerDescription** : [TriggerDescriptions](/sdk/references/manifest.md#triggerdescriptions)[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#encoder-triggerdescription "Direct link to TriggerDescription")
Descriptions that define the interaction of the action when it is associated with a dial / touchscreen on the Stream Deck +. This information is shown to the user.
**Examples:**
  * "Adjust volume"
  * "Play / Pause"


**background** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#encoder-background "Direct link to background")
Path to the image, with the **file extension omitted** , that will be displayed on the touchscreen behind the action's layout.
Image must be:
  * PNG or SVG format.
  * Provided in two sizes, 200 × 100 px and 400 × 200 px (@2x).


Note: Can be overridden by the user in the Stream Deck application.
**Examples:**
  * assets/backgrounds/main
  * imgs/bright-blue-bg


**layout** : `${string}.json`, "$A0", "$A1", "$B1", "$B2", "$C1", "$X1"[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#encoder-layout "Direct link to layout")
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
**Debug** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#nodejs-debug "Direct link to Debug")
Command-line arguments supplied to the plugin when run in debug mode. Optionally, the pre-defined values `"enabled"` and `"break"` run the plugin with a debugger enabled with [`--inspect`](https://nodejs.org/api/cli.html#--inspecthostport) and [`--inspect-brk`](https://nodejs.org/api/cli.html#--inspect-brkhostport) respectively.
Note: `"enabled"` and `"break"` will automatically be assigned an available `PORT` by Stream Deck. Alternatively, if you wish to debug on a pre-defined port, this value can be a set of [command-line arguments](https://nodejs.org/api/cli.html).
**Examples:**
  * `"enabled"` results in `--inspect=127.0.0.1:{PORT}`
  * `"break"` results in `--inspect-brk=127.0.0.1:{PORT}`
  * `"--inspect=127.0.0.1:12345"` runs a local debugger on port `12345`.


**GenerateProfilerOutput** : boolean[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#nodejs-generateprofileroutput "Direct link to GenerateProfilerOutput")
Determines whether to generate a profiler output for the plugin; [read more](https://nodejs.org/en/docs/guides/simple-profiling).
**Version** : "20", "24"[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#nodejs-version "Direct link to Version")Required
Version of Node.js to use.
### OS
Operating system that the plugin supports, and the minimum required version needed to run the plugin.
**Properties**
**MinimumVersion** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#os-minimumversion "Direct link to MinimumVersion")Required
Minimum version required of the operating system to run the plugin.
**Platform** : "mac", "windows"[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#os-platform "Direct link to Platform")Required
Operating system supported by the plugin.
### Profile
Provides information for pre-defined profile distributed with this plugin.
**Properties**
**AutoInstall** : boolean[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#profile-autoinstall "Direct link to AutoInstall")
Determines whether the profile should be automatically installed when the plugin is installed. When `false`, the profile will be installed the first time the plugin attempts to switch to it. Default is `true`.
Available from Stream Deck 6.6.
**DeviceType** : 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#profile-devicetype "Direct link to DeviceType")Required
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


**DontAutoSwitchWhenInstalled** : boolean[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#profile-dontautoswitchwheninstalled "Direct link to DontAutoSwitchWhenInstalled")
Determines whether the Stream Deck application should automatically switch to the profile when it is first installed. Default value is `false`.
**Name** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#profile-name "Direct link to Name")Required
Path to the `.streamDeckProfile`, with the **file extension omitted** , that contains the profiles layout and action settings.
**Examples:**
  * assets/main-profile
  * profiles/super-cool-profile


**Readonly** : boolean[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#profile-readonly "Direct link to Readonly")
Determines whether the profile is read-only, or if the user is able to customize it within the Stream Deck application. Default value is `false`.
### Software
Determines the Stream Deck software requirements for this plugin.
**Properties**
**MinimumVersion** : "6.4", "6.5", "6.6", "6.7", "6.8", "6.9", "7.0", "7.1", "7.2", "7.3", "7.4"[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#software-minimumversion "Direct link to MinimumVersion")Required
Minimum version of the Stream Deck application required for this plugin to run.
### State
States the action can be in. When two states are defined the action will act as a toggle, with users being able to select their preferred iconography for each state.
Note: Automatic toggling of the state on action activation can be disabled by setting `DisableAutomaticStates` to `true`.
**Properties**
**FontFamily** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#state-fontfamily "Direct link to FontFamily")
Default font-family to be used when rendering the title of this state.
Note: Can be overridden by the user in the Stream Deck application.
**FontSize** : number[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#state-fontsize "Direct link to FontSize")
Default font-size to be used when rendering the title of this state.
Note: Can be overridden by the user in the Stream Deck application.
**FontStyle** : "", "Bold Italic", "Bold", "Italic", "Regular"[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#state-fontstyle "Direct link to FontStyle")
Default font-style to be used when rendering the title of this state.
Note: Can be overridden by the user in the Stream Deck application.
**FontUnderline** : boolean[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#state-fontunderline "Direct link to FontUnderline")
Determines whether the title associated with this state is underlined by default.
Note: Can be overridden by the user in the Stream Deck application.
**Image** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#state-image "Direct link to Image")Required
Path to the image, with the **file extension omitted** , that will be displayed on the Stream Deck when this action's state is active.
Image must be:
  * GIF, PNG or SVG format.
  * Provided in two sizes, 72 × 72 px and 144 × 144 px (@2x).


Note: Can be overridden by the user in the Stream Deck application.
**Examples:**
  * assets/counter-key
  * assets/icons/mute


**MultiActionImage** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#state-multiactionimage "Direct link to MultiActionImage")
Path to the image, with the **file extension omitted** , that will be displayed when the action is being viewed as part of a multi-action.
Image must be:
  * PNG or SVG format.
  * Provided in two sizes, 72 × 72 px and 144 × 144 px (@2x).


Note: Can be overridden by the user in the Stream Deck application.
**Examples:**
  * assets/counter-key
  * assets/icons/mute


**Name** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#state-name "Direct link to Name")
Name of the state; when multiple states are defined this value is shown to the user when the action is being added to a multi-action. The user is then able to specify which state they would like to activate as part of the multi-action.
**ShowTitle** : boolean[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#state-showtitle "Direct link to ShowTitle")
Determines whether the title should be shown.
Note: Can be overridden by the user in the Stream Deck application.
**Title** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#state-title "Direct link to Title")
Default title to be shown when the action is added to the Stream Deck.
**TitleAlignment** : "bottom", "middle", "top"[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#state-titlealignment "Direct link to TitleAlignment")
Default title alignment to be used when rendering the title of this state.
Note: Can be overridden by the user in the Stream Deck application.
**TitleColor** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#state-titlecolor "Direct link to TitleColor")
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
**LongTouch** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#triggerdescriptions-longtouch "Direct link to LongTouch")
Touchscreen "long-touch" interaction behavior description.
**Push** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#triggerdescriptions-push "Direct link to Push")
Dial "push" (press) interaction behavior description.
**Rotate** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#triggerdescriptions-rotate "Direct link to Rotate")
Dial rotation interaction behavior description.
**Touch** : string[](https://docs.elgato.com/streamdeck/sdk/references/manifest/#triggerdescriptions-touch "Direct link to Touch")
Touchscreen "touch" interaction behavior description.