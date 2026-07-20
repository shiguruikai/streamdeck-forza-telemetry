---
type: UI Component Reference
title: "Date"
description: "The <sdpi-calendar type=\"date\"> component provides a styled wrapper of <input type=\"date\">."
resource: https://sdpi-components.dev/docs/components/calendar/date
tags: [sdpi-components, component, date]
timestamp: 2026-07-11T20:01:18.341364+09:00
---

# Date
The `<sdpi-calendar type="date">` component provides a styled wrapper of [`<input type="date">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date).
## Examples
Property Inspector HTML

```
<sdpi-item label="Date">  
    <sdpi-calendar type="date" setting="important_date"></sdpi-calendar>  
</sdpi-item>  

```

#### Result
![A date input in the Stream Deck property inspector using the sdpi-calendar web component](data:image/png;base64,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)
value
The value of `<sdpi-calendar type="date">` is represented as a `string`.

```
{  
    "important_date": "2022-04-01"  
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
