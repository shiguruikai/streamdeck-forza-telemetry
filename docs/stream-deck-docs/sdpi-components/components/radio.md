---
type: UI Component Reference
title: "Radio"
description: "The <sdpi-radio> component provides a styled wrapper of <input type=\"radio\">."
resource: https://sdpi-components.dev/docs/components/radio
tags: [sdpi-components, component, radio]
timestamp: 2026-07-11T20:01:18.353502+09:00
---

# Radio
The `<sdpi-radio>` component provides a styled wrapper of [`<input type="radio">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio).
## Example
Property Inspector HTML

```
<sdpi-item label="Radio">  
    <sdpi-radio setting="fav_number" columns="3">  
        <option value="1">One</option>  
        <option value="2">Two</option>  
        <option value="3">Three</option>  
        <option value="4">Four</option>  
        <option value="5">Five</option>  
    </sdpi-radio>  
</sdpi-item>  

```

#### Result
![A collection of radio inputs in the Stream Deck property inspector using the sdpi-radio web component](data:image/png;base64,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)
value
The value of `<sdpi-radio>` can be represented as a `boolean`, `number` or `string`, based on the `value-type`; the default type is `string`.

```
{  
    "value": true | 1 | "one"  
}  

```

## Configuration
The component supports the following configuration.  
| Name  | Type  | Description  |  
| --- | --- | --- |  
| `columns`  | `number`  | The number of columns to render the inputs in; valid values are 1-6.  |  
| `default`  | `string`  | The default value; shown when the persisted value is undefined.  |  
| `disabled`  | `boolean`  | Determines whether the input is disabled.  |  
| `value`  |  `boolean`, `number`, or `string`  | The value of the component, and the persisted setting.  |  
| `value-type`  |  `'boolean'`, `'number'`, or `'string'`  | Optional, the preferred value type of the persisted setting; when `'boolean'`, `'false'` and `0` will equate in `false`. Defaults to `'string'`.  |  
## Data Source
tip
Optionally, this components options can be loaded dynamically using the `datasource` attribute. When specified, this loads the options from the plugin, [read more](../data-source.md).  
| Name  | Type  | Description  |  
| --- | --- | --- |  
| `datasource`  | `string`  | The optional remote data source.  |  
| `hot-reload`  | `boolean`  | When present, `sendToPropertyInspector` is actively monitored allowing for the plugin to update the items.  |  
| `loading`  | `string`  | When a `datasource` is specified, this text is shown whilst the items are loaded.  |  
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
