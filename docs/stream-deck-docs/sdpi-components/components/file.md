---
type: UI Component Reference
title: "File"
description: "The <sdpi-file> component provides a styled wrapper of <input type=\"file\">."
resource: https://sdpi-components.dev/docs/components/file
tags: [sdpi-components, component, file]
timestamp: 2026-07-11T20:01:18.348979+09:00
---

# File
The `<sdpi-file>` component provides a styled wrapper of [`<input type="file">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file).
## Example
Property Inspector HTML

```
<sdpi-item label="File">  
    <sdpi-file setting="avatar" accept="image/png, image/jpeg"></sdpi-file>  
</sdpi-item>  

```

#### Result
![A file input in the Stream Deck property inspector using the sdpi-file web component](data:image/png;base64,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)
value
The value of `<sdpi-file>` is represented as a `string`.

```
{  
    "avatar": "C:\\Users\\Richard\\Pictures\\Profile.png"  
}  

```

## Configuration
The component supports the following configuration.  
| Name  | Type  | Description  |  
| --- | --- | --- |  
| `accept`  | `string`  | The types of files that can be selected; directly mapped to the input's `accept` attribute.  |  
| `disabled`  | `boolean`  | Determines whether the input is disabled.  |  
| `label`  | `string`  | Optional label displayed in the button used to activate the file selector (default `...`).  |  
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
