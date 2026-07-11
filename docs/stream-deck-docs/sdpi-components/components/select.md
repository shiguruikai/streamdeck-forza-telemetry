---
type: UI Component Reference
title: "Select"
description: "The <sdpi-select> component provides a styled wrapper of <select>."
resource: https://sdpi-components.dev/docs/components/select
tags: [sdpi-components, component, select]
timestamp: 2026-07-11T20:01:18.355289+09:00
---

# Select
The `<sdpi-select>` component provides a styled wrapper of [`<select>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select).
## Example
Property Inspector HTML

```
<sdpi-item label="Select">  
    <sdpi-select setting="color" placeholder="Please choose a color">  
        <optgroup label="Primary Colors">  
            <option value="#ff0000">Red</option>  
            <option value="#00ff00">Green</option>  
            <option value="#0000ff">Blue</option>  
        </optgroup>  
        <option value="#000000">Black</option>  
        <option value="#ffffff">White</option>  
    </sdpi-select>  
</sdpi-item>  

```

#### Result
![A select input in the Stream Deck property inspector using the sdpi-select web component](data:image/png;base64,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)
value
The value of `<sdpi-select>` can be represented as a `boolean`, `number` or `string`, based on the `value-type`; the default type is `string`.

```
{  
    "value": true | 1 | "one"  
}  

```

## Configuration
The component supports the following configuration.  
| Name  | Type  | Description  |  
| --- | --- | --- |  
| `default`  | `string`  | The default value; shown when the persisted value is undefined.  |  
| `disabled`  | `boolean`  | Determines whether the input is disabled.  |  
| `placeholder`  | `string`  | Optional placeholder text shown in the input.  |  
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
| `show-refresh`  | `boolean`  | When present, a refresh button is displayed next to the input.  |  
## Persistence
The value of the component can be automatically persisted to the Stream Deck with the following configuration.  
| Name  | Type  | Description  |  
| --- | --- | --- |  
| `global`  | `boolean`  | When present, the value will be persisted to the global settings.  |  
| `label-setting`  | `string`  | The path of the property where the label should be persisted in the settings; when reloading, if the original value is not available, this label is rendered as a disabled option.  |  
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
