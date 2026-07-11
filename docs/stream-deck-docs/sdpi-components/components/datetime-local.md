---
type: UI Component Reference
title: "Datetime"
description: "The <sdpi-calendar type=\"datetime-local\"> component provides a styled wrapper of <input type=\"datetime-local\">."
resource: https://sdpi-components.dev/docs/components/calendar/datetime-local
tags: [sdpi-components, component, datetime-local]
timestamp: 2026-07-11T20:01:18.342151+09:00
---

# Datetime
The `<sdpi-calendar type="datetime-local">` component provides a styled wrapper of [`<input type="datetime-local">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local).
## Examples
Property Inspector HTML

```
<sdpi-item label="Datetime">  
    <sdpi-calendar type="datetime-local" setting="fav_datetime"></sdpi-calendar>  
</sdpi-item>  

```

#### Result
![A localised date time input in the Stream Deck property inspector using the sdpi-calendar web component](data:image/png;base64,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)
value
The value of `<sdpi-calendar type="datetime-local">` is represented as a `string`.

```
{  
    "fav_datetime": "2022-04-01T16:30"  
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
