---
type: UI Component Reference
title: "Time"
description: "The <sdpi-calendar type=\"time\"> component provides a styled wrapper of <input type=\"time\">."
resource: https://sdpi-components.dev/docs/components/calendar/time
tags: [sdpi-components, component, time]
timestamp: 2026-07-11T20:01:18.343705+09:00
---

# Time
The `<sdpi-calendar type="time">` component provides a styled wrapper of [`<input type="time">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/time).
## Examples
Property Inspector HTML

```
<sdpi-item label="Time">  
    <sdpi-calendar type="time" setting="time_of_day"></sdpi-calendar>  
</sdpi-item>  

```

#### Result
![A time input in the Stream Deck property inspector using the sdpi-calendar web component](data:image/png;base64,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)
value
The value of `<sdpi-calendar type="time">` is represented as a `string`.

```
{  
    "time_of_day": "16:30"  
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
