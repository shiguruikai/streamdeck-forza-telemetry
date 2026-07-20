---
type: UI Component Reference
title: "Textarea"
description: "The <sdpi-textarea> component provides a styled wrapper of <textarea>."
resource: https://sdpi-components.dev/docs/components/textarea
tags: [sdpi-components, component, textarea]
timestamp: 2026-07-11T20:01:18.356165+09:00
---

# Textarea
The `<sdpi-textarea>` component provides a styled wrapper of [`<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea).
## Example
Property Inspector HTML

```
<sdpi-item label="Textarea">  
    <sdpi-textarea  
        setting="short_description"  
        maxlength="250"  
        rows="3"  
        showlength>  
    </sdpi-textarea>  
</sdpi-item>  

```

#### Result
![A textarea input in the Stream Deck property inspector using the sdpi-textarea web component](data:image/png;base64,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)
value
The value of `<sdpi-textarea>` is represented as a `string`.

```
{  
    "short_description": "Hello World"  
}  

```

## Configuration
The component supports the following configuration.  
| Name  | Type  | Description  |  
| --- | --- | --- |  
| `disabled`  | `boolean`  | Determines whether the input is disabled.  |  
| `maxlength`  | `number`  | Optional maximum length of the value.  |  
| `rows`  | `number`  | Defines the size, in rows, of the text area.  |  
| `showlength`  | `boolean`  | When present, the current length and maximum length are displayed.  |  
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
