---
type: UI Component Reference
title: "Week"
description: "The <sdpi-calendar type=\"week\"> component provides a styled wrapper of <input type=\"week\">."
resource: https://sdpi-components.dev/docs/components/calendar/week
tags: [sdpi-components, component, week]
timestamp: 2026-07-11T20:01:18.344563+09:00
---

# Week
The `<sdpi-calendar type="week">` component provides a styled wrapper of [`<input type="week">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/week).
## Examples
Property Inspector HTML

```
<sdpi-item label="Week">  
    <sdpi-calendar type="week" setting="week_of_the_year"></sdpi-calendar>  
</sdpi-item>  

```

#### Result
![A week input in the Stream Deck property inspector using the sdpi-calendar web component](data:image/png;base64,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)
value
The value of `<sdpi-calendar type="week">` is represented as a `string`.

```
{  
    "week_of_the_year": "2022-W13"  
}  

```

## Configuration  
| Name  | Type  | Description  |  
| --- | --- | --- |  
| `default`  | `string`  | The default value; shown when the persisted value is undefined.  |  
| `disabled`  | `boolean`  | Determines whether the input is disabled.  |  
| `max`  | `sting`  | The latest acceptable date ([read more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date#max)).  |  
| `min`  | `sting`  | The earliest acceptable date ([read more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date#min)).  |  
| `step`  | `number`  | Specifies the granularity that the value must adhere to ([read more](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date#step)).  |  
| `type`  | `string`  | Defines the type of input; valid values are `date`, `datetime-local`, `month`, `week`, or `time`.  |  
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
