---
type: UI Component Reference
title: "Checkbox List"
description: "The <sdpi-checkbox-list> component provides a way of rendering multiple <sdpi-checkbox> that represent a single value within the settings."
resource: https://sdpi-components.dev/docs/components/checkbox-list
tags: [sdpi-components, component, checkbox-list]
timestamp: 2026-07-11T20:01:18.346347+09:00
---

# Checkbox List
The `<sdpi-checkbox-list>` component provides a way of rendering multiple [`<sdpi-checkbox>`](checkbox.md) that represent a single value within the settings.
## Example
Property Inspector HTML

```
<sdpi-item label="Checkbox List">  
    <sdpi-checkbox-list setting="fav_numbers" columns="2">  
        <option value="1">One</option>  
        <option value="2">Two</option>  
        <option value="3">Three</option>  
        <option value="4">Four</option>  
        <option value="5">Five</option>  
    </sdpi-checkbox-list>  
</sdpi-item>  

```

#### Result
![A list of checkbox inputs in the Stream Deck property inspector using the sdpi-checkbox-list web component](data:image/png;base64,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)
value
The value of `<sdpi-checkbox-list>` is represented as a `Set` of either `boolean`, `number` or `string`, based on the `value-type`; the default type is `Set<string>`.

```
{  
    "value": [true] | [1] | ["one"]  
}  

```

caution
Although `<sdpi-checkbox-list>` utilizes `<sdpi-checkbox>`, the underlying `value` differs and are not a collection of `boolean`.
## Configuration
The component supports the following configuration.  
| Name  | Type  | Description  |  
| --- | --- | --- |  
| `columns`  | `number`  | The number of columns to render the inputs in; valid values are 1-6.  |  
| `disabled`  | `boolean`  | Determines whether the input is disabled.  |  
| `value`  |  `boolean[]`, `number[]`, or `string[]`  | The value of the component, and the persisted setting.  |  
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
