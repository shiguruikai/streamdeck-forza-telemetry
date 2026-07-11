---
type: API Reference
title: "Property Inspector (UI)"
description: "The property inspector (UI) connects to Stream Deck using a WebSocket, allowing it to directly receive a subset of events, and send commands. The WebSocket c..."
resource: https://docs.elgato.com/streamdeck/sdk/references/websocket/ui/
tags: [api, websocket, property-inspector]
timestamp: 2026-07-11T20:01:18.334466+09:00
---

# Property Inspector (UI)
The property inspector (UI) connects to Stream Deck using a WebSocket, allowing it to directly receive a subset of events, and send commands. The WebSocket connection also allows the property inspector to communicate with the application-layer (i.e. the plugin).
## Registration
  * Manually
  * Automatically

A connection with Stream Deck is established within the property inspector by defining a function on the `window`, named [`connectElgatoStreamDeckSocket`](websocket-ui.md#connectelgatostreamdecksocket). Once the DOM has loaded, Stream Deck will invoke this function and provide registration information, including the port to connect on.
Below is an example of implementing the `connectElgatoStreamDeckSocket` function to establish a connection with Stream Deck:
Connecting to Stream Deck in the property inspector

```
window.connectElgatoStreamDeckSocket = (port, uuid, event, info, actionInfo) => {
	const infoObj = JSON.parse(info); // Information about Stream Deck and the plugin.
    const actionInfo = JSON.parse(actionInfo); // Information about the action the UI is for.

    // Establish a connection with Stream Deck
	const connection = new WebSocket(`ws://127.0.0.1:${port}`);
	connection.onopen = () => {
		connection.send(JSON.stringify({ event, uuid }));
	};
};
```

Registration within the property inspector is automatically managed by [sdpi-components](../sdpi-components/introduction.md), and a [Stream Deck Client](../sdpi-components/stream-deck-client.md) is available to make communicating with Stream Deck easy. For example.
Get global settings in the property inspector

```
SDPIComponents
	.streamDeckClient
	.getGlobalSettings()
	.then((settings) => {
		console.log(settings);
	});
```

### connectElgatoStreamDeckSocket
Connects to the Stream Deck, enabling the UI to interact with the plugin, and access the Stream Deck API.

```
window.connectElgatoStreamDeckSocket = (port: string, uuid: string, event: string, info: string, actionInfo: string) => void | Promise<void>
```

**Parameters**  
| Name  | Description  |  
| --- | --- |  
| port  | Port to be used when connecting to Stream Deck.  |  
| uuid  | Identifies the UI; this must be provided when establishing the connection with Stream Deck.  |  
| event  | Name of the event that identifies the registration procedure; this must be provided when establishing the connection with Stream Deck.  |  
| info  | Information about the Stream Deck application and operating system.  |  
| actionInfo  | Information about the action the UI is associated with.  |  
### RegistrationInfo
Information about the Stream Deck application, the plugin, the user's operating system, user's Stream Deck devices, etc.

```
type RegistrationInfo = {
    application: {
        font: string;
        language: "de" | "en" | "es" | "fr" | "ja" | "ko" | "zh_CN" | "zh_TW";
        platform: "mac" | "windows";
        platformVersion: string;
        version: string;
    };
    colors: {
        buttonMouseOverBackgroundColor: string;
        buttonPressedBackgroundColor: string;
        buttonPressedBorderColor: string;
        buttonPressedTextColor: string;
        highlightColor: string;
    };
    devicePixelRatio: number;
    devices: {
        id: string;
        name: string;
        size: {
            columns: number;
            rows: number;
        };
        type: DeviceType;
    }[];
    plugin: {
        uuid: string;
        version: string;
    };
};
```

**application** : objectRequired
Stream Deck application specific information.
**font** : stringRequired
Font being used by the Stream Deck application.
**language** : "de" | "en" | "es" | "fr" | "ja" | "ko" | "zh_CN" | "zh_TW"Required
Users preferred language; this is used by the Stream Deck application for localization.
**platform** : "mac" | "windows"Required
Operating system.
**platformVersion** : stringRequired
Operating system version, e.g. "10" for Windows 10.
**version** : stringRequired
Stream Deck application version.
**colors** : objectRequired
Collection of preferred colors used by the Stream Deck.
**buttonMouseOverBackgroundColor** : stringRequired
Color that denotes the background of a button that is being moused over.
**buttonPressedBackgroundColor** : stringRequired
Color that denotes the background of a pressed button.
**buttonPressedBorderColor** : stringRequired
Color that denotes the border of a press button.
**buttonPressedTextColor** : stringRequired
Color that denotes the text of a pressed button.
**highlightColor** : stringRequired
Color of highlighted text.
**devicePixelRatio** : numberRequired
Pixel ratio, used to identify if the Stream Deck application is running on a high DPI screen.
**devices** : object[]Required
Devices associated with the Stream Deck application; this may include devices that are not currently connected. Use `"deviceDidConnect"` event to determine which devices are active.
**plugin** : objectRequired
Information about the plugin.
**uuid** : stringRequired
Unique identifier of the plugin, as defined by the plugin.
**version** : stringRequired
Version of the plugin.
## Events
### DidReceiveGlobalSettings
Occurs when the settings associated with the plugin are requested, or when the the plugin's settings were updated by the plugin.

```
type DidReceiveGlobalSettings = {
    event: "didReceiveGlobalSettings";
    payload: {
        settings: JsonObject;
    };
};
```

**event** : "didReceiveGlobalSettings"Required
Name of the event.
**payload** : objectRequired
Additional information about the event.
**settings** : JsonObjectRequired
Global settings associated with this plugin.
### DidReceiveResources
Occurs when the resources associated with an action instance are requested, or when the the resources were updated in the plugin.

```
type DidReceiveResources = {
    action: string;
    context: string;
    device: string;
    event: "didReceiveResources";
    id?: string;
    payload:
        | {
              controller: "Keypad";
              isInMultiAction: true;
              resources: {
                  [key: string]: string;
              };
              settings: JsonObject;
              state?: number;
          }
        | {
              controller: "Keypad" | "Encoder";
              coordinates: {
                  column: number;
                  row: number;
              };
              isInMultiAction: false;
              resources: {
                  [key: string]: string;
              };
              settings: JsonObject;
              state?: number;
          };
};
```

**action** : stringRequired
Identifies the action type, as specified by the UUID within the manifest.
**context** : stringRequired
Identifier for the instance of the action the event is for.
**device** : stringRequired
Identifier for the Stream Deck device the action is on.
**event** : "didReceiveResources"Required
Name of the event.
**id** : string
Identifier provided when requesting the resources, used to identify the source of the request.
This is always undefined if the event is received because the resources were changed in the plugin.
**payload** : ActionPayloadRequired
Additional information about the action.
One of:
MultiActionPayload
**controller** : "Keypad"Required
Defines the controller type of the action.
  * **Keypad** refers to a standard key action on a Stream Deck device.
  * **Encoder** refers to a dial / touchscreen on the Stream Deck +

**isInMultiAction** : trueRequired
Determines whether the action is part of a multi-action.
**Note:** Requires Stream Deck 6.7.
**resources** : ResourcesRequired
Resources (files) associated with the action.
Available from Stream Deck 7.1.
**settings** : JsonObjectRequired
Settings associated with the action instance.
**state** : number
Current state of the action; only applicable to actions that support multiple states.
SingleActionPayload
**controller** : ControllerRequired
Defines the controller type of the action.
  * **Keypad** refers to a standard key action on a Stream Deck device.
  * **Encoder** refers to a dial / touchscreen on the Stream Deck +

**coordinates** : CoordinatesRequired
Coordinates that identify the location of the action.
**column** : numberRequired
Column the action instance is located on; indexed from 0.
**Note:** For devices that support multiple controllers, for example Stream Deck +, each controller is treated separately, therefore there may be instances of `Keypad` and `Encoder` that have the same coordinates.
**row** : numberRequired
Row the action instance is located on; indexed from 0.
**Note:** For devices that support multiple controllers, for example Stream Deck +, each controller is treated separately, therefore there may be instances of `Keypad` and `Encoder` that have the same coordinates.
**isInMultiAction** : falseRequired
Determines whether the action is part of a multi-action.
NB. Requires Stream Deck 6.7 when accessed from the property inspector.
**resources** : ResourcesRequired
Resources (files) associated with the action.
Available from Stream Deck 7.1.
**settings** : JsonObjectRequired
Settings associated with the action instance.
**state** : number
Current state of the action; only applicable to actions that support multiple states.
### DidReceiveSettings
Occurs when the settings associated with an action instance are requested, or when the the settings were updated by the plugin.

```
type DidReceiveSettings = {
    action: string;
    context: string;
    device: string;
    event: "didReceiveSettings";
    payload:
        | {
              controller: "Keypad";
              isInMultiAction: true;
              resources: {
                  [key: string]: string;
              };
              settings: JsonObject;
              state?: number;
          }
        | {
              controller: "Keypad" | "Encoder";
              coordinates: {
                  column: number;
                  row: number;
              };
              isInMultiAction: false;
              resources: {
                  [key: string]: string;
              };
              settings: JsonObject;
              state?: number;
          };
};
```

**action** : stringRequired
Identifies the action type, as specified by the UUID within the manifest.
**context** : stringRequired
Identifier for the instance of the action the event is for.
**device** : stringRequired
Identifier for the Stream Deck device the action is on.
**event** : "didReceiveSettings"Required
Name of the event.
**payload** : ActionPayloadRequired
Additional information about the action.
One of:
MultiActionPayload
**controller** : "Keypad"Required
Defines the controller type of the action.
  * **Keypad** refers to a standard key action on a Stream Deck device.
  * **Encoder** refers to a dial / touchscreen on the Stream Deck +

**isInMultiAction** : trueRequired
Determines whether the action is part of a multi-action.
**Note:** Requires Stream Deck 6.7.
**resources** : ResourcesRequired
Resources (files) associated with the action.
Available from Stream Deck 7.1.
**settings** : JsonObjectRequired
Settings associated with the action instance.
**state** : number
Current state of the action; only applicable to actions that support multiple states.
SingleActionPayload
**controller** : ControllerRequired
Defines the controller type of the action.
  * **Keypad** refers to a standard key action on a Stream Deck device.
  * **Encoder** refers to a dial / touchscreen on the Stream Deck +

**coordinates** : CoordinatesRequired
Coordinates that identify the location of the action.
**column** : numberRequired
Column the action instance is located on; indexed from 0.
**Note:** For devices that support multiple controllers, for example Stream Deck +, each controller is treated separately, therefore there may be instances of `Keypad` and `Encoder` that have the same coordinates.
**row** : numberRequired
Row the action instance is located on; indexed from 0.
**Note:** For devices that support multiple controllers, for example Stream Deck +, each controller is treated separately, therefore there may be instances of `Keypad` and `Encoder` that have the same coordinates.
**isInMultiAction** : falseRequired
Determines whether the action is part of a multi-action.
NB. Requires Stream Deck 6.7 when accessed from the property inspector.
**resources** : ResourcesRequired
Resources (files) associated with the action.
Available from Stream Deck 7.1.
**settings** : JsonObjectRequired
Settings associated with the action instance.
**state** : number
Current state of the action; only applicable to actions that support multiple states.
### SendToPropertyInspector
Occurs when a payload was sent to the property inspector from the plugin.

```
type SendToPropertyInspector = {
    action: string;
    context: string;
    event: "sendToPropertyInspector";
    payload: JsonValue;
};
```

**action** : stringRequired
Identifies the action type, as specified by the UUID within the manifest.
**context** : stringRequired
Identifier for the instance of the action the event is for.
**event** : "sendToPropertyInspector"Required
Name of the event.
**payload** : JsonValueRequired
The payload sent to the property inspector.
## Commands
### GetGlobalSettings
Gets the global settings associated with the plugin. Causes `didReceiveGlobalSettings` to be emitted.

```
type GetGlobalSettings = {
    context: string;
    event: "getGlobalSettings";
};
```

**context** : stringRequired
The plugin's identifier, as provided by Stream Deck.
**event** : "getGlobalSettings"Required
Name of the command.
### GetResources
Gets the resources (files) associated with the action; these resources are embedded into the action when it is exported, either individually, or as part of a profile.
Available from Stream Deck 7.1.

```
type GetResources = {
    action: string;
    context: string;
    event: "getResources";
    id?: string;
};
```

**action** : stringRequired
Identifies the action type, as specified by the UUID within the manifest.
**context** : stringRequired
The action instance identifier.
**event** : "getResources"Required
Name of the command.
**id** : string
Optional identifier that can be used to identify the response to this request.
### GetSettings
Gets the settings associated with an instance of an action. Causes `didReceiveSettings` to be emitted.

```
type GetSettings = {
    action: string;
    context: string;
    event: "getSettings";
};
```

**action** : stringRequired
Identifies the action type, as specified by the UUID within the manifest.
**context** : stringRequired
The action instance identifier.
**event** : "getSettings"Required
Name of the command.
### OpenUrl
Opens the URL in the user's default browser.

```
type OpenUrl = {
    event: "openUrl";
    payload: {
        url: string;
    };
};
```

**event** : "openUrl"Required
Name of the command.
**payload** : objectRequired
Additional information supplied as part of the command.
**url** : stringRequired
URL to open.
### SendToPlugin
Sends a message to the plugin.

```
type SendToPlugin = {
    action: string;
    context: string;
    event: "sendToPlugin";
    payload: JsonValue;
};
```

**action** : stringRequired
Identifies the action type, as specified by the UUID within the manifest.
**context** : stringRequired
The action instance identifier.
**event** : "sendToPlugin"Required
Name of the command.
**payload** : JsonValueRequired
Payload to send.
### SetGlobalSettings
Sets the global settings associated with the plugin, and notifies the plugin by emitting `didReceiveGlobalSettings`.

```
type SetGlobalSettings = {
    context: string;
    event: "setGlobalSettings";
    payload: JsonObject;
};
```

**context** : stringRequired
The plugin's identifier, as provided by Stream Deck.
**event** : "setGlobalSettings"Required
Name of the command.
**payload** : JsonObjectRequired
Global settings to save.
### SetResources
Sets the resources (files) associated with the action; these resources are embedded into the action when it is exported, either individually, or as part of a profile.
Available from Stream Deck 7.1.

```
type SetResources = {
    action: string;
    context: string;
    event: "setResources";
    payload: {
        [key: string]: string;
    };
};
```

**action** : stringRequired
Identifies the action type, as specified by the UUID within the manifest.
**context** : stringRequired
The action instance identifier.
**event** : "setResources"Required
Name of the command.
**payload** : ResourcesRequired
Resources (files) associated with the action.
### SetSettings
Sets the settings associated with an action instance, and notifies the plugin by emitting `didReceiveSettings`.

```
type SetSettings = {
    action: string;
    context: string;
    event: "setSettings";
    payload: JsonObject;
};
```

**action** : stringRequired
Identifies the action type, as specified by the UUID within the manifest.
**context** : stringRequired
The action instance identifier.
**event** : "setSettings"Required
Name of the command.
**payload** : JsonObjectRequired
Action settings to save.
