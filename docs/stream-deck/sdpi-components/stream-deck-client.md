---
type: Guide
title: "Stream Deck Client"
description: "The streamDeckClient provides a wrapper for sending and receiving messages to and from the Stream Deck. It can be accessed under the SDPIComponents namespace..."
resource: https://sdpi-components.dev/docs/helpers/stream-deck-client
tags: [sdpi-components, helpers, stream-deck-client]
timestamp: 2026-07-11T20:01:18.362818+09:00
---

# Stream Deck Client
The `streamDeckClient` provides a wrapper for sending and receiving messages to and from the Stream Deck. It can be accessed under the `SDPIComponents` namespace, e.g.

```
const streamDeckClient = SDPIComponents.streamDeckClient;  

```

## Connection Info
Information supplied to the property inspector as part of the [registration procedure](../api/websocket-ui.md#registrationinfo) can be accessed via `getConnectionInfo()`.
Example

```
(async function () {  
    const info = await SDPIComponents.streamDeckClient.getConnectionInfo();  
})();  

```

tip
Data contained within the connection information includes:
  * Available Stream Deck devices.
  * The operating system.
  * Plugin version and UUID.
  * Action name, coordinates, settings, etc.

## Global Settings
### Get Global Settings
Requests the plugin's global settings, and returns payload as an awaitable promise (see [`getGlobalSettings`](../api/websocket-ui.md#getglobalsettings)).
Definition

```
getGlobalSettings(): Promise<Record<string, unknown>>;  

```

Example

```
(async function () {  
    const settings = await SDPIComponents.streamDeckClient.getGlobalSettings();  
})();  

```

### Set Global Settings
Sets the plugin's global settings (see [`setGlobalSettings`](../api/websocket-ui.md#setglobalsettings)).
Definition

```
setGlobalSettings(value: unknown): void;  

```

### Received Global Settings
An event that occurs when [`didReceiveGlobalSetting`](../api/websocket-ui.md#didreceiveglobalsettings) is received.
Definition

```
didReceiveGlobalSettings: EventManager<DidReceiveGlobalSettingsEvent>();  

```

Result Type

```
type DidReceiveGlobalSettingsEvent = {  
    event: 'didReceiveGlobalSettings';  
    payload: {  
        settings: Record<string, unknown>;  
    };  
};  

```

Example

```
SDPIComponents.streamDeckClient.didReceiveGlobalSettings.subscribe(console.log);  
/*  
Upon receiving the global settings, the output would look like this:  
{  
    event: 'didReceiveGlobalSettings',  
    payload: {  
        settings: {  
            foo: 'bar',  
            lorem: 'ipsum'  
        }  
    }  
}  
*/  

```

## Settings
note
These settings are relative to the action associated with the active property inspector.
### Get Settings
Requests the action's settings, and returns the payload as an awaitable promise (see [`getSettings`](../api/websocket-ui.md#getsettings))).
Definition

```
getSettings(): Promise<ActionSettingsPayload>  

```

Result Type

```
type ActionSettingsPayload = {  
    coordinates?: {  
        column: number;  
        row: number;  
    };  
    isInMultiAction: boolean;  
    settings: Record<string, unknown>;  
};  

```

note
The result maps from the `payload` object of [`getSettings`](../api/websocket-ui.md#getsettings).
Example

```
(async function () {  
    const settings = await SDPIComponents.streamDeckClient.getSettings();  
})();  

```

### Set Settings
Sets the action's settings (see [`setSettings`](../api/websocket-ui.md#setsettings)).
Definition

```
setSettings(value: unknown): void  

```

### Received Settings
An event that occurs when [`didReceiveSetting`](../api/websocket-ui.md#didreceivesettings) is received.
Definition

```
didReceiveGlobalSettings: EventManager<DidReceiveSettingsEvent>();  

```

Example

```
SDPIComponents.streamDeckClient.didReceiveSettings.subscribe(console.log);  
/*  
Upon receiving the settings, the output would look like this:  
{  
    action: 'com.elgato.sdpi.counter',  
    context: '3F5021CBD379BF30781CA3EB2516DD23',  
    device: 'B3F7C6D19695AF13B95578F2C29EB037',  
    event: 'didReceiveSetting',  
    payload: {  
        coordinates: {  
            column: 1,  
            row: 1  
        },  
        settings: {  
            bar: 'foo',  
            ipsum: 'lorem'  
        }  
    }  
}  
*/  

```

## Sent to Property Inspector
An event that occurs when [`sendToPropertyInspector`](../api/websocket-ui.md#didreceivepluginmessage) is received.
Definition

```
sendToPropertyInspector: EventManager<SendToPropertyInspectorEvent>();  

```

Example

```
SDPIComponents.streamDeckClient.sendToPropertyInspector.subscribe(console.log);  
/*  
Upon receiving the settings, the output would look like this:  
{  
    action: 'com.elgato.sdpi.counter',  
    context: '3F5021CBD379BF30781CA3EB2516DD23',  
    event: 'sendToPropertyInspector'  
    payload: {  
        msg: 'Hello world'  
    }  
}  
*/  

```

## Send
Sends a message to the Stream Deck; the message is automatically associated with the current action.
Definition

```
send<T extends EventSent['event']>(event: T, payload?: unknown): Promise<void>;  

```

Example

```
(async function () {  
    const payload = { url: 'https://sdpi-components.dev' };  
    await SDPIComponents.streamDeckClient.send('openUrl', payload);  
})();  

```

tip
Valid values of `event` are:
  * getSettings
  * setSettings
  * getGlobalSettings
  * setGlobalSettings
  * logMessage
  * openUrl
  * sendToPlugin
