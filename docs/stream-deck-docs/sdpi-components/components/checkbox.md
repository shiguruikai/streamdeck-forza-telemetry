---
type: UI Component Reference
title: "Checkbox"
description: "The <sdpi-checkbox> component provides a styled wrapper of <input type=\"checkbox\">."
resource: https://sdpi-components.dev/docs/components/checkbox
tags: [sdpi-components, component, checkbox]
timestamp: 2026-07-11T20:01:18.345312+09:00
---

# Checkbox
The `<sdpi-checkbox>` component provides a styled wrapper of [`<input type="checkbox">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox).
## Example
Property Inspector HTML

```
<sdpi-item label="Checkbox">  
    <sdpi-checkbox setting="is_okay" label="Is everything okay?"></sdpi-checkbox>  
</sdpi-item>  

```

#### Result
![A checkbox input in the Stream Deck property inspector using the sdpi-checkbox web component](data:image/png;base64,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)
value
The value of `<sdpi-checkbox>` is represented as a `boolean`.

```
{  
    "is_okay": true  
}  

```

## Configuration
The component supports the following configuration.  
| Name  | Type  | Description  |  
| --- | --- | --- |  
| `default`  | `boolean`  | The default value; shown when the persisted value is undefined.  |  
| `disabled`  | `boolean`  | Determines whether the input is disabled.  |  
| `label`  | `string`  | Optional label text shown to the right of the checkbox.  |  
| `value`  | `boolean`  | The value of the component (comparable to `checked`), and the persisted setting.  |  
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
