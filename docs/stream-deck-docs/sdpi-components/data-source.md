---
type: Guide
title: "Data Source"
description: "Sometimes it might be necessary to dynamically populate a component with a data source, e.g. when showing connected devices in a <sdpi-select> input. Thankfu..."
resource: https://sdpi-components.dev/docs/helpers/data-source
tags: [sdpi-components, helpers, data-source]
timestamp: 2026-07-11T20:01:18.360054+09:00
---

# Data Source
Sometimes it might be necessary to dynamically populate a component with a data source, e.g. when showing connected devices in a `<sdpi-select>` input. Thankfully the `datasource` attribute makes this incredibly easy.
supported components
Data sourcing is supported in the following components
  * `<sdpi-checkbox-list>`
  * `<sdpi-radio>`
  * `<sdpi-select>`

Sample Plugin
The sample plugin "Product Viewer" is available on [GitHub](https://github.com/elgatosf/streamdeck-plugin-samples/tree/main/data-sources), and demonstrates working with data sources.
## Property Inspector
During the initialization of the component, when a `datasource` is specified, a request for the data source's items is sent to the plugin using [`sendToPlugin`](../api/websocket-ui.md#sendtoplugin).
Property Inspector HTML

```
<sdpi-select  
    setting="color"  
    datasource="getColors"  
    loading="Fetching colors..."  
    hot-reload>  
</sdpi-select>  

```

tip
The optional `loading` attribute indicates the text to display whilst the data source is loading.
tip
The data source can be refreshed manually by calling `.refresh()` on the element. When the data source is being refreshed, the payload sent to the plugin will include the `event`, and `isRefresh: true`.
The message structure of the `sendToPlugin` event when requesting the data source's items looks as follow:

```
{  
    action,  
    event,  
    context,  
    payload: {  
        event: "getColors",  
        isRefresh: undefined | true  
    }  
}  

```

### Configuration
All components that support data sources have the following configuration options.  
| Name  | Type  | Description  |  
| --- | --- | --- |  
| `datasource`  | `string`  | The optional remote data source.  |  
| `hot-reload`  | `boolean`  | When present, `sendToPropertyInspector` is actively monitored allowing for the plugin to update the items.  |  
| `loading`  | `string`  | When a `datasource` is specified, this text is shown whilst the items are loaded.  |  
## Plugin
important
This is the important stuff; your plugin must return the data source using the `sendToPropertyInspector` using a specific payload structure.
Following the request for a data source, the plugin is responsible for "responding" using the [`sendToPropertyInspector`](../api/websocket-plugin.md#sendtopropertyinspector) using a standardized [payload structure](data-source.md#payload-structure).

```
{  
    action,  
    event,  
    context,  
    payload: {  
        event: "getColors",  
        items: [{  
            label: 'Primary Colors',  
            children: [{  
                label: 'Red',  
                value: '#ff0000'  
            }, {  
                label: 'Green',  
                value: '#00ff00'  
            }, {  
                label: 'Blue',  
                value: '#0000ff'  
            }]  
        }, {  
            label: 'Black',  
            value: '#000000'  
        }, {  
            label: 'White',  
            value: '#ffffff'  
        }]  
    }  
}  

```

With this example, the `<sdpi-select>` within the property inspector would then look like this after loading.
![An sdpi-select component demonstrating the use of the datasource attribute](data:image/png;base64,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)
## Payload Structure
The nested payload sent to the property inspector, from the plugin, via `sendToPropertyInspector` must include:
  * `event` - The event that requested the data source.
  * `items` - The items of the data source.

Payload returned to the property inspector

```
declare type DataSourcePayload = {  
    event: string;  
    items: DataSourceResult;  
};  

```

Data source types

```
declare type DataSourceResult = DataSourceResultItem[];  
declare type DataSourceResultItem = Item | ItemGroup;  
  
declare type Item = {  
    disabled?: boolean;  
    label?: string;  
    value: string;  
};  
  
declare type ItemGroup = {  
    label?: string;  
    children: Item[];  
};  

```
