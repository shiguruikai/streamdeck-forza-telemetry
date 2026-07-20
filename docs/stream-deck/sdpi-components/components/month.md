---
type: UI Component Reference
title: "Month"
description: "The <sdpi-calendar type=\"month\"> component provides a styled wrapper of <input type=\"month\">."
resource: https://sdpi-components.dev/docs/components/calendar/month
tags: [sdpi-components, component, month]
timestamp: 2026-07-11T20:01:18.342926+09:00
---

# Month
The `<sdpi-calendar type="month">` component provides a styled wrapper of [`<input type="month">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/month).
## Examples
Property Inspector HTML

```
<sdpi-item label="Month">  
    <sdpi-calendar type="month" setting="suniest_month"></sdpi-calendar>  
</sdpi-item>  

```

#### Result
![A month input in the Stream Deck property inspector using the sdpi-calendar web component](data:image/png;base64,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)
value
The value of `<sdpi-calendar type="month">` is represented as a `string`.

```
{  
    "suniest_month": "2022-04"  
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
