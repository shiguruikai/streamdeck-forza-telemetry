---
type: API Reference
title: "Plugin"
description: "Stream Deck provides an API for distributing plugins as native console apps, for example those written in C++, C#, etc, with communication being handled by a..."
resource: https://docs.elgato.com/streamdeck/sdk/references/websocket/plugin/
tags: [api, websocket, plugin]
timestamp: 2026-07-11T20:01:18.332841+09:00
---

# Plugin
Stream Deck provides an API for distributing plugins as native console apps, for example those written in C++, C#, etc, with communication being handled by a dedicated WebSocket connection.
warning
Creating native plugins is an advanced technique, and is not recommended. Instead, consider using the Stream Deck SDK with [Node.js native addons](https://nodejs.org/api/n-api.html#node-api).
## Registration
In order to establish a connection with Stream Deck, your plugin must first register itself using a unique identifier. The information required to establish the connection is provided as a command line parameter, along with:  
| Parameter  | Description  |  
| --- | --- |  
| `-port`  | The port the WebSocket is running on.  |  
| `-info`  | A serialized JSON string that contains information about Stream Deck, Stream Deck devices, and your plugin. See [RegistrationInfo](websocket-plugin.md#registrationinfo).  |  
| `-pluginUUID`  | Your plugin's unique registration identifier.  |  
| `‑registerEvent`  | Name of the registration event.  |  
Upon startup, your plugin must connect to the WebSocket on the specified `-port`, and send a registration message as a JSON serialized string in the following format:
Registration event type

```
type RegisterEvent = {
	event: string; // -registerEvent parameter
	uuid: string; // -pluginUUID parameter
};
```

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
Plugins can receive the following events from Stream Deck via their WebSocket connection.
warning
The `context` of an action is not guaranteed to persist across app cycles and therefore should not be used as a long-term identifier externally.
### ApplicationDidLaunch
Occurs when a monitored application is launched. Monitored applications can be defined in the `manifest.json` file via the `Manifest.ApplicationsToMonitor` property. See also `ApplicationDidTerminate`.

```
type ApplicationDidLaunch = {
    event: "applicationDidLaunch";
    payload: {
        application: string;
    };
};
```

**event** : "applicationDidLaunch"Required
Name of the event used to identify what occurred.
**payload** : objectRequired
Payload containing information about the application that triggered the event.
**application** : stringRequired
Name of the application that triggered the event.
### ApplicationDidTerminate
Occurs when a monitored application terminates. Monitored applications can be defined in the `manifest.json` file via the `Manifest.ApplicationsToMonitor` property. See also `ApplicationDidLaunch`.

```
type ApplicationDidTerminate = {
    event: "applicationDidTerminate";
    payload: {
        application: string;
    };
};
```

**event** : "applicationDidTerminate"Required
Name of the event used to identify what occurred.
**payload** : objectRequired
Payload containing information about the application that triggered the event.
**application** : stringRequired
Name of the application that triggered the event.
### DeviceDidChange
Occurs when a Stream Deck device changed, for example its name or size.
Available from Stream Deck 7.0.

```
type DeviceDidChange = {
    device: string;
    deviceInfo: {
        name: string;
        size: {
            columns: number;
            rows: number;
        };
        type: DeviceType;
    };
    event: "deviceDidChange";
};
```

**device** : stringRequired
Unique identifier of the Stream Deck device that this event is associated with.
**deviceInfo** : DeviceInfoRequired
Information about the device that changed.
**name** : stringRequired
Name of the device, as specified by the user in the Stream Deck application.
**size** : SizeRequired
Number of action slots, excluding dials / touchscreens, available to the device.
**columns** : numberRequired
Number of columns available on the Stream Deck device.
**rows** : numberRequired
Number of rows available on the Stream Deck device.
**type** : DeviceTypeRequired
Type of the device that was connected, e.g. Stream Deck +, Stream Deck Pedal, etc. See `DeviceType`.
**event** : "deviceDidChange"Required
Name of the event used to identify what occurred.
### DeviceDidConnect
Occurs when a Stream Deck device is connected. See also `DeviceDidDisconnect`.

```
type DeviceDidConnect = {
    device: string;
    deviceInfo: {
        name: string;
        size: {
            columns: number;
            rows: number;
        };
        type: DeviceType;
    };
    event: "deviceDidConnect";
};
```

**device** : stringRequired
Unique identifier of the Stream Deck device that this event is associated with.
**deviceInfo** : DeviceInfoRequired
Information about the newly connected device.
**name** : stringRequired
Name of the device, as specified by the user in the Stream Deck application.
**size** : SizeRequired
Number of action slots, excluding dials / touchscreens, available to the device.
**columns** : numberRequired
Number of columns available on the Stream Deck device.
**rows** : numberRequired
Number of rows available on the Stream Deck device.
**type** : DeviceTypeRequired
Type of the device that was connected, e.g. Stream Deck +, Stream Deck Pedal, etc. See `DeviceType`.
**event** : "deviceDidConnect"Required
Name of the event used to identify what occurred.
### DeviceDidDisconnect
Occurs when a Stream Deck device is disconnected. See also `DeviceDidConnect`.

```
type DeviceDidDisconnect = {
    device: string;
    event: "deviceDidDisconnect";
};
```

**device** : stringRequired
Unique identifier of the Stream Deck device that this event is associated with.
**event** : "deviceDidDisconnect"Required
Name of the event used to identify what occurred.
### DialDown
Occurs when the user presses a dial (Stream Deck +). See also `DialUp`.
NB: For other action types see `KeyDown`.

```
type DialDown = {
    action: string;
    context: string;
    device: string;
    event: "dialDown";
    payload: {
        controller: "Encoder";
        coordinates: {
            column: number;
            row: number;
        };
        resources: {
            [key: string]: string;
        };
        settings: JsonObject;
    };
};
```

**action** : stringRequired
Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`) e.g. "com.elgato.wavelink.mute".
**context** : stringRequired
Identifies the instance of an action that caused the event, i.e. the specific key or dial. This identifier can be used to provide feedback to the Stream Deck, persist and request settings associated with the action instance, etc.
**device** : stringRequired
Unique identifier of the Stream Deck device that this event is associated with.
**event** : "dialDown"Required
Name of the event used to identify what occurred.
**payload** : TPayloadRequired
Contextualized information for this event.
**controller** : "Encoder"Required
Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2, or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.
**coordinates** : CoordinatesRequired
Coordinates that identify the location of the action.
**column** : numberRequired
Column the action instance is located in, indexed from 0.
**row** : numberRequired
Row the action instance is located on, indexed from 0.
Note: When the device is Stream Deck +, the row can be 0 for keys (`Keypad`), and will _always_ be 0 for dials (`Encoder`); to differentiate between actions types, cross-check the `controller`.
**resources** : ResourcesRequired
Resources (files) associated with the action.
Available from Stream Deck 7.1.
**settings** : JsonObjectRequired
Settings associated with the action instance.
### DialRotate
Occurs when the user rotates a dial (Stream Deck +).

```
type DialRotate = {
    action: string;
    context: string;
    device: string;
    event: "dialRotate";
    payload: {
        controller: "Encoder";
        coordinates: {
            column: number;
            row: number;
        };
        pressed: boolean;
        resources: {
            [key: string]: string;
        };
        settings: JsonObject;
        ticks: number;
    };
};
```

**action** : stringRequired
Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`) e.g. "com.elgato.wavelink.mute".
**context** : stringRequired
Identifies the instance of an action that caused the event, i.e. the specific key or dial. This identifier can be used to provide feedback to the Stream Deck, persist and request settings associated with the action instance, etc.
**device** : stringRequired
Unique identifier of the Stream Deck device that this event is associated with.
**event** : "dialRotate"Required
Name of the event used to identify what occurred.
**payload** : TPayloadRequired
Contextualized information for this event.
**controller** : "Encoder"Required
Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2, or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.
**coordinates** : CoordinatesRequired
Coordinates that identify the location of the action.
**column** : numberRequired
Column the action instance is located in, indexed from 0.
**row** : numberRequired
Row the action instance is located on, indexed from 0.
Note: When the device is Stream Deck +, the row can be 0 for keys (`Keypad`), and will _always_ be 0 for dials (`Encoder`); to differentiate between actions types, cross-check the `controller`.
**pressed** : booleanRequired
Determines whether the dial was pressed whilst the rotation occurred.
**resources** : ResourcesRequired
Resources (files) associated with the action.
Available from Stream Deck 7.1.
**settings** : JsonObjectRequired
Settings associated with the action instance.
**ticks** : numberRequired
Number of ticks the dial was rotated; this can be a positive (clockwise) or negative (counter-clockwise) number.
### DialUp
Occurs when the user releases a pressed dial (Stream Deck +). See also `DialDown`.
NB: For other action types see `KeyUp`.

```
type DialUp = {
    action: string;
    context: string;
    device: string;
    event: "dialUp";
    payload: {
        controller: "Encoder";
        coordinates: {
            column: number;
            row: number;
        };
        resources: {
            [key: string]: string;
        };
        settings: JsonObject;
    };
};
```

**action** : stringRequired
Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`) e.g. "com.elgato.wavelink.mute".
**context** : stringRequired
Identifies the instance of an action that caused the event, i.e. the specific key or dial. This identifier can be used to provide feedback to the Stream Deck, persist and request settings associated with the action instance, etc.
**device** : stringRequired
Unique identifier of the Stream Deck device that this event is associated with.
**event** : "dialUp"Required
Name of the event used to identify what occurred.
**payload** : TPayloadRequired
Contextualized information for this event.
**controller** : "Encoder"Required
Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2, or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.
**coordinates** : CoordinatesRequired
Coordinates that identify the location of the action.
**column** : numberRequired
Column the action instance is located in, indexed from 0.
**row** : numberRequired
Row the action instance is located on, indexed from 0.
Note: When the device is Stream Deck +, the row can be 0 for keys (`Keypad`), and will _always_ be 0 for dials (`Encoder`); to differentiate between actions types, cross-check the `controller`.
**resources** : ResourcesRequired
Resources (files) associated with the action.
Available from Stream Deck 7.1.
**settings** : JsonObjectRequired
Settings associated with the action instance.
### DidReceiveDeepLink
Occurs when Stream Deck receives a deep-link message intended for the plugin. The message is re-routed to the plugin, and provided as part of the payload. One-way deep-link message can be routed to the plugin using the URL format `streamdeck://plugins/message/<PLUGIN_UUID>/{MESSAGE}`.

```
type DidReceiveDeepLink = {
    event: "didReceiveDeepLink";
    payload: {
        url: string;
    };
};
```

**event** : "didReceiveDeepLink"Required
Name of the event used to identify what occurred.
**payload** : objectRequired
Payload containing information about the URL that triggered the event.
**url** : stringRequired
The deep-link URL, with the prefix omitted.
### DidReceiveGlobalSettings
Occurs when the plugin receives the global settings from Stream Deck.

```
type DidReceiveGlobalSettings = {
    event: "didReceiveGlobalSettings";
    id?: string;
    payload: {
        settings: JsonObject;
    };
};
```

**event** : "didReceiveGlobalSettings"Required
Name of the event used to identify what occurred.
**id** : string
Identifier provided when requesting the settings, used to identify the source of the request.
This is always undefined if the event is received because the settings were changed in the property inspector.
**payload** : objectRequired
Additional information about the event that occurred.
**settings** : JsonObjectRequired
Global settings associated with this plugin.
### DidReceivePropertyInspectorMessage
Occurs when a payload was received from the UI.

```
type DidReceivePropertyInspectorMessage = {
    action: string;
    context: string;
    event: "sendToPlugin";
    payload: JsonValue;
};
```

**action** : stringRequired
Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`) e.g. "com.elgato.wavelink.mute".
**context** : stringRequired
Identifies the instance of an action that caused the event, i.e. the specific key or dial. This identifier can be used to provide feedback to the Stream Deck, persist and request settings associated with the action instance, etc.
**event** : "sendToPlugin"Required
Name of the event used to identify what occurred.
**payload** : JsonValueRequired
Contextualized information for this event.
### DidReceiveResources
Occurs when the resources associated with an action instance are requested, or when the the resources were updated in the property inspector.

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
              controller: "Encoder" | "Keypad";
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
Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`) e.g. "com.elgato.wavelink.mute".
**context** : stringRequired
Identifies the instance of an action that caused the event, i.e. the specific key or dial. This identifier can be used to provide feedback to the Stream Deck, persist and request settings associated with the action instance, etc.
**device** : stringRequired
Unique identifier of the Stream Deck device that this event is associated with.
**event** : "didReceiveResources"Required
Name of the event used to identify what occurred.
**id** : string
Identifier provided when requesting the resources, used to identify the source of the request.
This is always undefined if the event is received because the resources were changed in the property inspector.
**payload** : MultiActionPayload | SingleActionPayloadRequired
Contextualized information for this event.
One of:
MultiActionPayload
**controller** : "Keypad"Required
Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2, or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.
NB: Requires Stream Deck 6.5 for `WillAppear` and `WillDisappear` events.
**isInMultiAction** : trueRequired
Determines whether the action is part of a multi-action.
NB. Requires Stream Deck 6.7 when accessed from the property inspector.
**resources** : ResourcesRequired
Resources (files) associated with the action.
Available from Stream Deck 7.1.
**settings** : JsonObjectRequired
Settings associated with the action instance.
**state** : number
Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.
SingleActionPayload
**controller** : ControllerRequired
Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2, or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.
**coordinates** : CoordinatesRequired
Coordinates that identify the location of an action.
**column** : numberRequired
Column the action instance is located in, indexed from 0.
**row** : numberRequired
Row the action instance is located on, indexed from 0.
Note: When the device is Stream Deck +, the row can be 0 for keys (`Keypad`), and will _always_ be 0 for dials (`Encoder`); to differentiate between actions types, cross-check the `controller`.
**isInMultiAction** : falseRequired
Determines whether the action is part of a multi-action.
NB. Requires Stream Deck 6.7 when accessed from the property inspector.
**resources** : ResourcesRequired
Resources (files) associated with the action.
Available from Stream Deck 7.1.
**settings** : JsonObjectRequired
Settings associated with the action instance.
**state** : number
Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.
### DidReceiveSecrets
Occurs when the plugin receives secrets from Stream Deck.

```
type DidReceiveSecrets = {
    event: "didReceiveSecrets";
    payload: {
        secrets: JsonObject;
    };
};
```

**event** : "didReceiveSecrets"Required
Name of the event used to identify what occurred.
**payload** : objectRequired
Payload containing secrets associated with this plugin.
**secrets** : JsonObjectRequired
Secrets associated with this plugin.
### DidReceiveSettings
Occurs when the settings associated with an action instance are requested, or when the the settings were updated in the property inspector.

```
type DidReceiveSettings = {
    action: string;
    context: string;
    device: string;
    event: "didReceiveSettings";
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
              controller: "Encoder" | "Keypad";
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
Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`) e.g. "com.elgato.wavelink.mute".
**context** : stringRequired
Identifies the instance of an action that caused the event, i.e. the specific key or dial. This identifier can be used to provide feedback to the Stream Deck, persist and request settings associated with the action instance, etc.
**device** : stringRequired
Unique identifier of the Stream Deck device that this event is associated with.
**event** : "didReceiveSettings"Required
Name of the event used to identify what occurred.
**id** : string
Identifier provided when requesting the settings, used to identify the source of the request.
This is always undefined if the event is received because the settings were changed in the property inspector.
**payload** : MultiActionPayload | SingleActionPayloadRequired
Contextualized information for this event.
One of:
MultiActionPayload
**controller** : "Keypad"Required
Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2, or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.
NB: Requires Stream Deck 6.5 for `WillAppear` and `WillDisappear` events.
**isInMultiAction** : trueRequired
Determines whether the action is part of a multi-action.
NB. Requires Stream Deck 6.7 when accessed from the property inspector.
**resources** : ResourcesRequired
Resources (files) associated with the action.
Available from Stream Deck 7.1.
**settings** : JsonObjectRequired
Settings associated with the action instance.
**state** : number
Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.
SingleActionPayload
**controller** : ControllerRequired
Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2, or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.
**coordinates** : CoordinatesRequired
Coordinates that identify the location of an action.
**column** : numberRequired
Column the action instance is located in, indexed from 0.
**row** : numberRequired
Row the action instance is located on, indexed from 0.
Note: When the device is Stream Deck +, the row can be 0 for keys (`Keypad`), and will _always_ be 0 for dials (`Encoder`); to differentiate between actions types, cross-check the `controller`.
**isInMultiAction** : falseRequired
Determines whether the action is part of a multi-action.
NB. Requires Stream Deck 6.7 when accessed from the property inspector.
**resources** : ResourcesRequired
Resources (files) associated with the action.
Available from Stream Deck 7.1.
**settings** : JsonObjectRequired
Settings associated with the action instance.
**state** : number
Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.
### KeyDown
Occurs when the user presses a action down. See also `KeyUp`.
NB: For dials / touchscreens see `DialDown`.

```
type KeyDown = {
    action: string;
    context: string;
    device: string;
    event: "keyDown";
    payload:
        | {
              controller: "Keypad";
              isInMultiAction: true;
              resources: {
                  [key: string]: string;
              };
              settings: JsonObject;
              state?: number;
              userDesiredState: number;
          }
        | {
              controller: "Keypad";
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
Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`) e.g. "com.elgato.wavelink.mute".
**context** : stringRequired
Identifies the instance of an action that caused the event, i.e. the specific key or dial. This identifier can be used to provide feedback to the Stream Deck, persist and request settings associated with the action instance, etc.
**device** : stringRequired
Unique identifier of the Stream Deck device that this event is associated with.
**event** : "keyDown"Required
Name of the event used to identify what occurred.
**payload** : MultiActionKeyGesturePayload | SingleActionPayloadRequired
Contextualized information for this event.
One of:
MultiActionKeyGesturePayload
**controller** : "Keypad"Required
Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2, or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.
NB: Requires Stream Deck 6.5 for `WillAppear` and `WillDisappear` events.
**isInMultiAction** : trueRequired
Determines whether the action is part of a multi-action.
NB. Requires Stream Deck 6.7 when accessed from the property inspector.
**resources** : ResourcesRequired
Resources (files) associated with the action.
Available from Stream Deck 7.1.
**settings** : JsonObjectRequired
Settings associated with the action instance.
**state** : number
Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.
**userDesiredState** : numberRequired
Desired state as specified by the user; only applicable to actions that have multiple states defined within the `manifest.json` file, and when this action instance is part of a multi-action.
SingleActionPayload
**controller** : "Keypad"Required
Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2, or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.
**coordinates** : CoordinatesRequired
Coordinates that identify the location of an action.
**column** : numberRequired
Column the action instance is located in, indexed from 0.
**row** : numberRequired
Row the action instance is located on, indexed from 0.
Note: When the device is Stream Deck +, the row can be 0 for keys (`Keypad`), and will _always_ be 0 for dials (`Encoder`); to differentiate between actions types, cross-check the `controller`.
**isInMultiAction** : falseRequired
Determines whether the action is part of a multi-action.
NB. Requires Stream Deck 6.7 when accessed from the property inspector.
**resources** : ResourcesRequired
Resources (files) associated with the action.
Available from Stream Deck 7.1.
**settings** : JsonObjectRequired
Settings associated with the action instance.
**state** : number
Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.
### KeyUp
Occurs when the user releases a pressed action. See also `KeyDown`.
NB: For dials / touchscreens see `DialUp`.

```
type KeyUp = {
    action: string;
    context: string;
    device: string;
    event: "keyUp";
    payload:
        | {
              controller: "Keypad";
              isInMultiAction: true;
              resources: {
                  [key: string]: string;
              };
              settings: JsonObject;
              state?: number;
              userDesiredState: number;
          }
        | {
              controller: "Keypad";
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
Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`) e.g. "com.elgato.wavelink.mute".
**context** : stringRequired
Identifies the instance of an action that caused the event, i.e. the specific key or dial. This identifier can be used to provide feedback to the Stream Deck, persist and request settings associated with the action instance, etc.
**device** : stringRequired
Unique identifier of the Stream Deck device that this event is associated with.
**event** : "keyUp"Required
Name of the event used to identify what occurred.
**payload** : MultiActionKeyGesturePayload | SingleActionPayloadRequired
Contextualized information for this event.
One of:
MultiActionKeyGesturePayload
**controller** : "Keypad"Required
Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2, or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.
NB: Requires Stream Deck 6.5 for `WillAppear` and `WillDisappear` events.
**isInMultiAction** : trueRequired
Determines whether the action is part of a multi-action.
NB. Requires Stream Deck 6.7 when accessed from the property inspector.
**resources** : ResourcesRequired
Resources (files) associated with the action.
Available from Stream Deck 7.1.
**settings** : JsonObjectRequired
Settings associated with the action instance.
**state** : number
Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.
**userDesiredState** : numberRequired
Desired state as specified by the user; only applicable to actions that have multiple states defined within the `manifest.json` file, and when this action instance is part of a multi-action.
SingleActionPayload
**controller** : "Keypad"Required
Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2, or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.
**coordinates** : CoordinatesRequired
Coordinates that identify the location of an action.
**column** : numberRequired
Column the action instance is located in, indexed from 0.
**row** : numberRequired
Row the action instance is located on, indexed from 0.
Note: When the device is Stream Deck +, the row can be 0 for keys (`Keypad`), and will _always_ be 0 for dials (`Encoder`); to differentiate between actions types, cross-check the `controller`.
**isInMultiAction** : falseRequired
Determines whether the action is part of a multi-action.
NB. Requires Stream Deck 6.7 when accessed from the property inspector.
**resources** : ResourcesRequired
Resources (files) associated with the action.
Available from Stream Deck 7.1.
**settings** : JsonObjectRequired
Settings associated with the action instance.
**state** : number
Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.
### PropertyInspectorDidAppear
Occurs when the property inspector associated with the action becomes visible, i.e. the user selected an action in the Stream Deck application. See also `PropertyInspectorDidDisappear`.

```
type PropertyInspectorDidAppear = {
    action: string;
    context: string;
    device: string;
    event: "propertyInspectorDidAppear";
};
```

**action** : stringRequired
Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`) e.g. "com.elgato.wavelink.mute".
**context** : stringRequired
Identifies the instance of an action that caused the event, i.e. the specific key or dial. This identifier can be used to provide feedback to the Stream Deck, persist and request settings associated with the action instance, etc.
**device** : stringRequired
Unique identifier of the Stream Deck device that this event is associated with.
**event** : "propertyInspectorDidAppear"Required
Name of the event used to identify what occurred.
### PropertyInspectorDidDisappear
Occurs when the property inspector associated with the action becomes invisible, i.e. the user unselected the action in the Stream Deck application. See also `PropertyInspectorDidAppear`.

```
type PropertyInspectorDidDisappear = {
    action: string;
    context: string;
    device: string;
    event: "propertyInspectorDidDisappear";
};
```

**action** : stringRequired
Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`) e.g. "com.elgato.wavelink.mute".
**context** : stringRequired
Identifies the instance of an action that caused the event, i.e. the specific key or dial. This identifier can be used to provide feedback to the Stream Deck, persist and request settings associated with the action instance, etc.
**device** : stringRequired
Unique identifier of the Stream Deck device that this event is associated with.
**event** : "propertyInspectorDidDisappear"Required
Name of the event used to identify what occurred.
### SystemDidWakeUp
Occurs when the computer wakes up.

```
type SystemDidWakeUp = {
    event: "systemDidWakeUp";
};
```

**event** : "systemDidWakeUp"Required
Name of the event used to identify what occurred.
### TitleParametersDidChange
Occurs when the user updates an action's title settings in the Stream Deck application.

```
type TitleParametersDidChange = {
    action: string;
    context: string;
    device: string;
    event: "titleParametersDidChange";
    payload: {
        controller: "Encoder" | "Keypad";
        coordinates: {
            column: number;
            row: number;
        };
        resources: {
            [key: string]: string;
        };
        settings: JsonObject;
        state?: number;
        title: string;
        titleParameters: {
            fontFamily: string;
            fontSize: number;
            fontStyle: "" | "Bold Italic" | "Bold" | "Italic" | "Regular";
            fontUnderline: boolean;
            showTitle: boolean;
            titleAlignment: "bottom" | "middle" | "top";
            titleColor: string;
        };
    };
};
```

**action** : stringRequired
Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`) e.g. "com.elgato.wavelink.mute".
**context** : stringRequired
Identifies the instance of an action that caused the event, i.e. the specific key or dial. This identifier can be used to provide feedback to the Stream Deck, persist and request settings associated with the action instance, etc.
**device** : stringRequired
Unique identifier of the Stream Deck device that this event is associated with.
**event** : "titleParametersDidChange"Required
Name of the event used to identify what occurred.
**payload** : TPayloadRequired
Contextualized information for this event.
**controller** : ControllerRequired
Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2, or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.
**coordinates** : CoordinatesRequired
Coordinates that identify the location of an action.
**column** : numberRequired
Column the action instance is located in, indexed from 0.
**row** : numberRequired
Row the action instance is located on, indexed from 0.
Note: When the device is Stream Deck +, the row can be 0 for keys (`Keypad`), and will _always_ be 0 for dials (`Encoder`); to differentiate between actions types, cross-check the `controller`.
**resources** : ResourcesRequired
Resources (files) associated with the action.
Available from Stream Deck 7.1.
**settings** : JsonObjectRequired
Settings associated with the action instance.
**state** : number
Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.
**title** : stringRequired
Title of the action, as specified by the user or dynamically by the plugin.
**titleParameters** : objectRequired
Defines aesthetic properties that determine how the title should be rendered.
**fontFamily** : stringRequired
Font-family the title will be rendered with.
**fontSize** : numberRequired
Font-size the title will be rendered in.
**fontStyle** : "" | "Bold Italic" | "Bold" | "Italic" | "Regular"Required
Typography of the title.
**fontUnderline** : booleanRequired
Determines whether the font should be underlined.
**showTitle** : booleanRequired
Determines whether the user has opted to show, or hide the title for this action instance.
**titleAlignment** : "bottom" | "middle" | "top"Required
Alignment of the title.
**titleColor** : stringRequired
Color of the title, represented as a hexadecimal value.
### TouchTap
Occurs when the user taps the touchscreen (Stream Deck +).

```
type TouchTap = {
    action: string;
    context: string;
    device: string;
    event: "touchTap";
    payload: {
        controller: "Encoder";
        coordinates: {
            column: number;
            row: number;
        };
        hold: boolean;
        resources: {
            [key: string]: string;
        };
        settings: JsonObject;
        tapPos: [x: number, y: number];
    };
};
```

**action** : stringRequired
Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`) e.g. "com.elgato.wavelink.mute".
**context** : stringRequired
Identifies the instance of an action that caused the event, i.e. the specific key or dial. This identifier can be used to provide feedback to the Stream Deck, persist and request settings associated with the action instance, etc.
**device** : stringRequired
Unique identifier of the Stream Deck device that this event is associated with.
**event** : "touchTap"Required
Name of the event used to identify what occurred.
**payload** : TPayloadRequired
Contextualized information for this event.
**controller** : "Encoder"Required
Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2, or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.
**coordinates** : CoordinatesRequired
Coordinates that identify the location of the action.
**column** : numberRequired
Column the action instance is located in, indexed from 0.
**row** : numberRequired
Row the action instance is located on, indexed from 0.
Note: When the device is Stream Deck +, the row can be 0 for keys (`Keypad`), and will _always_ be 0 for dials (`Encoder`); to differentiate between actions types, cross-check the `controller`.
**hold** : booleanRequired
Determines whether the tap was considered "held".
**resources** : ResourcesRequired
Resources (files) associated with the action.
Available from Stream Deck 7.1.
**settings** : JsonObjectRequired
Settings associated with the action instance.
**tapPos** : [x: number, y: number]Required
Coordinates of where the touchscreen tap occurred, relative to the canvas of the action.
### WillAppear
Occurs when an action appears on the Stream Deck due to the user navigating to another page, profile, folder, etc. This also occurs during startup if the action is on the "front page". An action refers to _all_ types of actions, e.g. keys, dials, touchscreens, pedals, etc.

```
type WillAppear = {
    action: string;
    context: string;
    device: string;
    event: "willAppear";
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
              controller: "Encoder" | "Keypad";
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
Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`) e.g. "com.elgato.wavelink.mute".
**context** : stringRequired
Identifies the instance of an action that caused the event, i.e. the specific key or dial. This identifier can be used to provide feedback to the Stream Deck, persist and request settings associated with the action instance, etc.
**device** : stringRequired
Unique identifier of the Stream Deck device that this event is associated with.
**event** : "willAppear"Required
Name of the event used to identify what occurred.
**payload** : MultiActionPayload | SingleActionPayloadRequired
Contextualized information for this event.
One of:
MultiActionPayload
**controller** : "Keypad"Required
Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2, or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.
NB: Requires Stream Deck 6.5 for `WillAppear` and `WillDisappear` events.
**isInMultiAction** : trueRequired
Determines whether the action is part of a multi-action.
NB. Requires Stream Deck 6.7 when accessed from the property inspector.
**resources** : ResourcesRequired
Resources (files) associated with the action.
Available from Stream Deck 7.1.
**settings** : JsonObjectRequired
Settings associated with the action instance.
**state** : number
Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.
SingleActionPayload
**controller** : ControllerRequired
Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2, or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.
**coordinates** : CoordinatesRequired
Coordinates that identify the location of an action.
**column** : numberRequired
Column the action instance is located in, indexed from 0.
**row** : numberRequired
Row the action instance is located on, indexed from 0.
Note: When the device is Stream Deck +, the row can be 0 for keys (`Keypad`), and will _always_ be 0 for dials (`Encoder`); to differentiate between actions types, cross-check the `controller`.
**isInMultiAction** : falseRequired
Determines whether the action is part of a multi-action.
NB. Requires Stream Deck 6.7 when accessed from the property inspector.
**resources** : ResourcesRequired
Resources (files) associated with the action.
Available from Stream Deck 7.1.
**settings** : JsonObjectRequired
Settings associated with the action instance.
**state** : number
Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.
### WillDisappear
Occurs when an action disappears from the Stream Deck due to the user navigating to another page, profile, folder, etc. An action refers to _all_ types of actions, e.g. keys, dials, touchscreens, pedals, etc.

```
type WillDisappear = {
    action: string;
    context: string;
    device: string;
    event: "willDisappear";
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
              controller: "Encoder" | "Keypad";
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
Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`) e.g. "com.elgato.wavelink.mute".
**context** : stringRequired
Identifies the instance of an action that caused the event, i.e. the specific key or dial. This identifier can be used to provide feedback to the Stream Deck, persist and request settings associated with the action instance, etc.
**device** : stringRequired
Unique identifier of the Stream Deck device that this event is associated with.
**event** : "willDisappear"Required
Name of the event used to identify what occurred.
**payload** : MultiActionPayload | SingleActionPayloadRequired
Contextualized information for this event.
One of:
MultiActionPayload
**controller** : "Keypad"Required
Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2, or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.
NB: Requires Stream Deck 6.5 for `WillAppear` and `WillDisappear` events.
**isInMultiAction** : trueRequired
Determines whether the action is part of a multi-action.
NB. Requires Stream Deck 6.7 when accessed from the property inspector.
**resources** : ResourcesRequired
Resources (files) associated with the action.
Available from Stream Deck 7.1.
**settings** : JsonObjectRequired
Settings associated with the action instance.
**state** : number
Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.
SingleActionPayload
**controller** : ControllerRequired
Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2, or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.
**coordinates** : CoordinatesRequired
Coordinates that identify the location of an action.
**column** : numberRequired
Column the action instance is located in, indexed from 0.
**row** : numberRequired
Row the action instance is located on, indexed from 0.
Note: When the device is Stream Deck +, the row can be 0 for keys (`Keypad`), and will _always_ be 0 for dials (`Encoder`); to differentiate between actions types, cross-check the `controller`.
**isInMultiAction** : falseRequired
Determines whether the action is part of a multi-action.
NB. Requires Stream Deck 6.7 when accessed from the property inspector.
**resources** : ResourcesRequired
Resources (files) associated with the action.
Available from Stream Deck 7.1.
**settings** : JsonObjectRequired
Settings associated with the action instance.
**state** : number
Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.
## Commands
Plugins can send the following commands to Stream Deck via their WebSocket connection.
### GetGlobalSettings
Gets the global settings associated with the plugin. Causes `DidReceiveGlobalSettings` to be emitted.

```
type GetGlobalSettings = {
    context: string;
    event: "getGlobalSettings";
    id?: string;
};
```

**context** : stringRequired
Defines the context of the command, e.g. which action instance the command is intended for.
**event** : "getGlobalSettings"Required
Name of the command, used to identify the request.
**id** : string
Optional identifier that can be used to identify the response to this request.
### GetResources
Gets the resources (files) associated with the action; these resources are embedded into the action when it is exported, either individually, or as part of a profile.
Available from Stream Deck 7.1.

```
type GetResources = {
    context: string;
    event: "getResources";
    id?: string;
};
```

**context** : stringRequired
Defines the context of the command, e.g. which action instance the command is intended for.
**event** : "getResources"Required
Name of the command, used to identify the request.
**id** : string
Optional identifier that can be used to identify the response to this request.
### GetSecrets
Gets secrets associated with the plugin.

```
type GetSecrets = {
    context: string;
    event: "getSecrets";
};
```

**context** : stringRequired
Defines the context of the command, e.g. which action instance the command is intended for.
**event** : "getSecrets"Required
Name of the command, used to identify the request.
### GetSettings
Gets the settings associated with an instance of an action. Causes `DidReceiveSettings` to be emitted.

```
type GetSettings = {
    context: string;
    event: "getSettings";
    id?: string;
};
```

**context** : stringRequired
Defines the context of the command, e.g. which action instance the command is intended for.
**event** : "getSettings"Required
Name of the command, used to identify the request.
**id** : string
Optional identifier that can be used to identify the response to this request.
### LogMessage
Logs a message to the file-system.

```
type LogMessage = {
    event: "logMessage";
    payload: {
        message: string;
    };
};
```

**event** : "logMessage"Required
Name of the command, used to identify the request.
**payload** : TPayloadRequired
Additional information supplied as part of the command.
**message** : stringRequired
Message to log.
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
Name of the command, used to identify the request.
**payload** : TPayloadRequired
Additional information supplied as part of the command.
**url** : stringRequired
URL to open.
### SendToPropertyInspector
Sends a message to the property inspector.

```
type SendToPropertyInspector = {
    context: string;
    event: "sendToPropertyInspector";
    payload: JsonValue;
};
```

**context** : stringRequired
Defines the context of the command, e.g. which action instance the command is intended for.
**event** : "sendToPropertyInspector"Required
Name of the command, used to identify the request.
**payload** : JsonValueRequired
Additional information supplied as part of the command.
### SetFeedback
Set's the feedback of an existing layout associated with an action instance.

```
type SetFeedback = {
    context: string;
    event: "setFeedback";
    payload: {
        [string]:
            | string
            | number
            | {
                  background?: string;
                  bar_bg_c?: string;
                  bar_border_c?: string;
                  bar_fill_c?: string;
                  border_w?: number;
                  enabled?: boolean;
                  opacity?: 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;
                  range?: {
                      max: number;
                      min: number;
                  };
                  subtype?: 0 | 1 | 2 | 3 | 4;
                  value?: number;
                  zOrder?: number;
              }
            | {
                  background?: string;
                  bar_bg_c?: string;
                  bar_border_c?: string;
                  bar_fill_c?: string;
                  bar_h?: number;
                  border_w?: number;
                  enabled?: boolean;
                  opacity?: 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;
                  range?: {
                      max: number;
                      min: number;
                  };
                  subtype?: 0 | 1 | 2 | 3 | 4;
                  value?: number;
                  zOrder?: number;
              }
            | {
                  background?: string;
                  enabled?: boolean;
                  opacity?: 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;
                  value?: string;
                  zOrder?: number;
              }
            | {
                  alignment?: "center" | "left" | "right";
                  background?: string;
                  color?: string;
                  enabled?: boolean;
                  font?: {
                      size?: number;
                      weight?: number;
                  };
                  opacity?: 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;
                  "text-overflow"?: "clip" | "ellipsis" | "fade";
                  value?: string;
                  zOrder?: number;
              };
    };
};
```

**context** : stringRequired
Defines the context of the command, e.g. which action instance the command is intended for.
**event** : "setFeedback"Required
Name of the command, used to identify the request.
**payload** : TPayloadRequired
Additional information supplied as part of the command.
### SetFeedbackLayout
Sets the layout associated with an action instance.

```
type SetFeedbackLayout = {
    context: string;
    event: "setFeedbackLayout";
    payload: {
        layout: string;
    };
};
```

**context** : stringRequired
Defines the context of the command, e.g. which action instance the command is intended for.
**event** : "setFeedbackLayout"Required
Name of the command, used to identify the request.
**payload** : TPayloadRequired
Additional information supplied as part of the command.
**layout** : stringRequired
Name of a pre-defined layout, or relative path to a custom one.
### SetGlobalSettings
Sets the global settings associated with the plugin.

```
type SetGlobalSettings = {
    context: string;
    event: "setGlobalSettings";
    payload: JsonObject;
};
```

**context** : stringRequired
Defines the context of the command, e.g. which action instance the command is intended for.
**event** : "setGlobalSettings"Required
Name of the command, used to identify the request.
**payload** : JsonObjectRequired
Additional information supplied as part of the command.
### SetImage
Sets the image associated with an action instance.

```
type SetImage = {
    context: string;
    event: "setImage";
    payload: {
        image?: string;
        state?: number;
        target?: Target;
    };
};
```

**context** : stringRequired
Defines the context of the command, e.g. which action instance the command is intended for.
**event** : "setImage"Required
Name of the command, used to identify the request.
**payload** : TPayloadRequired
Additional information supplied as part of the command.
**image** : string
Image to display; this can be either a path to a local file within the plugin's folder, a base64 encoded `string` with the mime type declared (e.g. PNG, JPEG, etc.),
**state** : number
Action state the command applies to; when no state is supplied, the image is set for both states. **Note** , only applies to multi-state actions.
**target** : Target
Specifies which aspects of the Stream Deck should be updated, hardware, software, or both.
### SetResources
Sets the resources (files) associated with the action; these resources are embedded into the action when it is exported, either individually, or as part of a profile.
Available from Stream Deck 7.1.

```
type SetResources = {
    context: string;
    event: "setResources";
    payload: {
        [key: string]: string;
    };
};
```

**context** : stringRequired
Defines the context of the command, e.g. which action instance the command is intended for.
**event** : "setResources"Required
Name of the command, used to identify the request.
**payload** : TPayloadRequired
Additional information supplied as part of the command.
### SetSettings
Sets the settings associated with an instance of an action.

```
type SetSettings = {
    context: string;
    event: "setSettings";
    payload: JsonObject;
};
```

**context** : stringRequired
Defines the context of the command, e.g. which action instance the command is intended for.
**event** : "setSettings"Required
Name of the command, used to identify the request.
**payload** : JsonObjectRequired
Additional information supplied as part of the command.
### SetState
Sets the current state of an action instance.

```
type SetState = {
    context: string;
    event: "setState";
    payload: {
        state: number;
    };
};
```

**context** : stringRequired
Defines the context of the command, e.g. which action instance the command is intended for.
**event** : "setState"Required
Name of the command, used to identify the request.
**payload** : TPayloadRequired
Additional information supplied as part of the command.
**state** : numberRequired
State to set; this be either 0, or 1.
### SetTitle
Sets the title displayed for an instance of an action.

```
type SetTitle = {
    context: string;
    event: "setTitle";
    payload: {
        state?: number;
        target?: Target;
        title?: string;
    };
};
```

**context** : stringRequired
Defines the context of the command, e.g. which action instance the command is intended for.
**event** : "setTitle"Required
Name of the command, used to identify the request.
**payload** : TPayloadRequired
Additional information supplied as part of the command.
**state** : number
Action state the request applies to; when no state is supplied, the title is set for both states. **Note** , only applies to multi-state actions.
**target** : Target
Specifies which aspects of the Stream Deck should be updated, hardware, software, or both.
**title** : string
Title to display; when no title is specified, the title will reset to the title set by the user.
### SetTriggerDescription
Sets the trigger descriptions associated with an encoder action instance.

```
type SetTriggerDescription = {
    context: string;
    event: "setTriggerDescription";
    payload: {
        longTouch?: string;
        push?: string;
        rotate?: string;
        touch?: string;
    };
};
```

**context** : stringRequired
Defines the context of the command, e.g. which action instance the command is intended for.
**event** : "setTriggerDescription"Required
Name of the command, used to identify the request.
**payload** : TPayloadRequired
Additional information supplied as part of the command.
**longTouch** : string
Touchscreen "long-touch" interaction behavior description; when `undefined`, the description will not be shown.
**push** : string
Dial "push" (press) interaction behavior description; when `undefined`, the description will not be shown.
**rotate** : string
Dial rotation interaction behavior description; when `undefined`, the description will not be shown.
**touch** : string
Touchscreen "touch" interaction behavior description; when `undefined`, the description will not be shown.
### ShowAlert
Temporarily shows an alert (i.e. warning), in the form of an exclamation mark in a yellow triangle, on the action instance. Used to provide visual feedback when an action failed.

```
type ShowAlert = {
    context: string;
    event: "showAlert";
};
```

**context** : stringRequired
Defines the context of the command, e.g. which action instance the command is intended for.
**event** : "showAlert"Required
Name of the command, used to identify the request.
### ShowOk
Temporarily shows an "OK" (i.e. success), in the form of a check-mark in a green circle, on the action instance. Used to provide visual feedback when an action successfully executed.

```
type ShowOk = {
    context: string;
    event: "showOk";
};
```

**context** : stringRequired
Defines the context of the command, e.g. which action instance the command is intended for.
**event** : "showOk"Required
Name of the command, used to identify the request.
### SwitchToProfile
Switches to the profile, as distributed by the plugin, on the specified device.
NB: Plugins may only switch to profiles distributed with the plugin, as defined within the manifest, and cannot access user-defined profiles.

```
type SwitchToProfile = {
    context: string;
    device: string;
    event: "switchToProfile";
    payload: {
        page?: number;
        profile?: string;
    };
};
```

**context** : stringRequired
Defines the context of the command, e.g. which action instance the command is intended for.
**device** : stringRequired
Unique identifier of the device where the profile should be set.
**event** : "switchToProfile"Required
Name of the command, used to identify the request.
**payload** : TPayloadRequired
Additional information supplied as part of the command.
**page** : number
Optional page to show when switching to the profile, indexed from 0. When `undefined`, the page that was previously visible (when switching away from the profile will be made visible.
**profile** : string
Name of the profile to switch to; the name must be identical to the one provided in the manifest.
When not specified, Stream Deck will switch to the previous profile.
