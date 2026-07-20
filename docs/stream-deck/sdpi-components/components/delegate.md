---
type: UI Component Reference
title: "Delegate"
description: "The <sdpi-delegate> component enables the invocation of a sendToPlugin event, allowing for the persisted setting to be delegated to the plugin, and then rend..."
resource: https://sdpi-components.dev/docs/components/delegate
tags: [sdpi-components, component, delegate]
timestamp: 2026-07-11T20:01:18.347975+09:00
---

# Delegate
The `<sdpi-delegate>` component enables the invocation of a `sendToPlugin` event, allowing for the persisted setting to be delegated to the plugin, and then rendered within this component.
tip
The `<sdpi-delegate>` component is useful for functionality that is not native to the property inspector, e.g. browsing for a folder.
## Example
Property Inspector HTML

```
<sdpi-item label="Delegate">  
    <sdpi-delegate  
        setting="delegated_value"  
        invoke="eventName"  
        label="...">  
    </sdpi-delegate>  
</sdpi-item>  

```

#### Result
![A delegated input in the Stream Deck property inspector using the sdpi-delegate web component](data:image/png;base64,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)
value
Unlike other components, the value of the `<sdpi-delegate>` component is determined by the plugin. When the component is invoked, a payload containing the `invoke` attribute is sent to the plugin using `sendToPlugin` with the following structure.

```
{  
    action,  
    event,  
    context,  
    payload: {  
        event: "eventName"  
    }  
}  
  

```

Once the plugin has set the persisted value, it is then rendered within the `<sdpi-delegate>` component using `.toString()`.
## Configuration
The component supports the following configuration.  
| Name  | Type  | Description  |  
| --- | --- | --- |  
| `default`  | `string`  | The default value; shown when the persisted value is undefined.  |  
| `disabled`  | `boolean`  | Determines whether the input is disabled.  |  
| `format-type`  | `string`  | Type of formatting to be used when rendering the value (see [Formatting](delegate.md#formatting)).  |  
| `label`  | `string`  | Label text shown within the button; defaults to an ellipsis.  |  
| `invoke`  | `string`  | The `payload.event` name supplied to the plugin when the delegate is invoked.  |  
| `value`  | `unknown`  | The value of the component, and the persisted setting.  |  
### Formatting
Supported `format-type` are:
  * `path` - The value is parsed as a local path, and the directory or file name is rendered.

## Persistence
The value of the component can be automatically persisted to the Stream Deck with the following configuration.  
| Name  | Type  | Description  |  
| --- | --- | --- |  
| `global`  | `boolean`  | When present, the value will be persisted to the global settings.  |  
| `setting`  | `string`  | The path of the property where the value should be persisted in the settings.  |  
setting
The `setting` represents the path of a property. If required, this path can denote a nested property within the settings, e.g. if the `setting` were `foo.bar.prop`, the value would be saved to:

```
{  
    "foo": {  
        "bar": {  
            "prop": <value>  
        }  
    }  
}  

```
