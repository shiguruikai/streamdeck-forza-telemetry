---
type: UI Component Reference
title: "Color"
description: "The <sdpi-color> component provides a styled wrapper of <input type=\"color\">."
resource: https://sdpi-components.dev/docs/components/color
tags: [sdpi-components, component, color]
timestamp: 2026-07-11T20:01:18.347083+09:00
---

# Color
The `<sdpi-color>` component provides a styled wrapper of [`<input type="color">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/color).
## Example
Property Inspector HTML

```
<sdpi-item label="Color">  
    <sdpi-color setting="selected_color"></sdpi-color>  
</sdpi-item>  

```

#### Result
![A color picker input in the Stream Deck property inspector using the sdpi-color web component](data:image/png;base64,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)
value
The value of `<sdpi-color>` is represented as a hex `string`.

```
{  
    "selected_color": "#00aaff"  
}  

```

## Configuration
The component supports the following configuration.  
| Name  | Type  | Description  |  
| --- | --- | --- |  
| `default`  | `string`  | The default value; shown when the persisted value is undefined.  |  
| `disabled`  | `boolean`  | Determines whether the input is disabled.  |  
| `value`  | `string`  | The value of the component, and the persisted setting.  |  
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
