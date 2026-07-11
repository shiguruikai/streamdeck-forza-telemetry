---
type: UI Component Reference
title: "Range"
description: "The <sdpi-range> component provides a styled wrapper of <input type=\"range\">."
resource: https://sdpi-components.dev/docs/components/range
tags: [sdpi-components, component, range]
timestamp: 2026-07-11T20:01:18.354291+09:00
---

# Range
The `<sdpi-range>` component provides a styled wrapper of [`<input type="range">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range).
## Example
Property Inspector HTML

```
<sdpi-item label="Range">  
    <sdpi-range  
        setting="brightness"  
        min="0"  
        max="100"  
        step="5"  
        showlabels>  
    </sdpi-range>  
</sdpi-item>  

```

#### Result
![A range input in the Stream Deck property inspector using the sdpi-range web component](data:image/png;base64,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)
value
The value of `<sdpi-range>` is represented as a `number`.

```
{  
    "brightness": 50  
}  

```

## Configuration
The component supports the following configuration.  
| Name  | Type  | Description  |  
| --- | --- | --- |  
| `default`  | `string`  | The default value; shown when the persisted value is undefined.  |  
| `disabled`  | `boolean`  | Determines whether the inputs are disabled.  |  
| `max`  | `number`  | Maximum possible value.  |  
| `min`  | `number`  | Minimum possible value.  |  
| `showlabels`  | `boolean`  | When specified, the minimum and maximum labels are shown.  |  
| `step`  | `number`  | Specifies the granularity that the value must adhere to.  |  
| `value`  | `string`  | The value of the component, and the persisted setting.  |  
labels
When using `showlabels`, it is possible to show custom labels using `slots`, for example.

```
<sdpi-range min="0" max="100" showlabels>  
    <span slot="min">0%</span>  
    <span slot="max">100%</span>  
</sdpi-range>  

```

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
