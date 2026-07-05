---
type: Reference
title: "Touch Strip Layout"
description: "In addition to the built-in touch strip layouts, you can also create bespoke layouts which allow you to completely customize how content is rendered o"
resource: "https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout"
tags: ['streamdeck', 'sdk', 'touch-strip-layout']
timestamp: "2026-07-05T18:29:48.267537+09:00"
version: "2.0.0"
---

# Touch Strip Layout
In addition to the [built-in touch strip layouts](/sdk/guides/dials.md#built-in-layouts), you can also create bespoke layouts which allow you to completely customize how content is rendered on a Stream Deck + touch strip. Your bespoke layouts are represented as either a JSON file distributed with your plugin, or programmatically using an object.
Shared touch strip
The Stream Deck + touch strip is shared amongst four actions, with each action able to render one quarter of the touch strip occupying 200 × 100 px. Natively, your plugin cannot render the _entire_ touch strip, however to mimic this behavior, all four actions assigned to the touch strip would need to be from your plugin, and their quarters updated individually.
## JSON Schema
A JSON schema is available for layout JSON files, providing intellisense and validation, and is available at the following URL:
JSON schema URL

```
https://schemas.elgato.com/streamdeck/plugins/layout.json
```

You can reference this URL using the `$schema` property within your layout JSON file:
Layout JSON file

```
{
	"$schema": "https://schemas.elgato.com/streamdeck/plugins/layout.json",
	"id": "CustomLayout",
	"items": [
		// ...
	]
}
```

## TypeScript Declaration
Layout TypeScript declaration

```
type Layout = {
    id: string;
    items: (
        | {
              background?: string;
              bar_bg_c?: string;
              bar_border_c?: string;
              bar_fill_c?: string;
              border_w?: number;
              enabled?: boolean;
              key: string;
              opacity?: 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;
              range?: {
                  max: number;
                  min: number;
              };
              rect: [x: number, y: number, width: number, height: number];
              subtype?: 0 | 1 | 2 | 3 | 4;
              type: "bar";
              value: number;
              zOrder?: number;
          }
        | {
              background?: string;
              bar_bg_c?: string;
              bar_border_c?: string;
              bar_fill_c?: string;
              bar_h?: number;
              border_w?: number;
              enabled?: boolean;
              key: string;
              opacity?: 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;
              range?: {
                  max: number;
                  min: number;
              };
              rect: [x: number, y: number, width: number, height: number];
              subtype?: 0 | 1 | 2 | 3 | 4;
              type: "gbar";
              value: number;
              zOrder?: number;
          }
        | {
              background?: string;
              enabled?: boolean;
              key: string;
              opacity?: 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;
              rect: [x: number, y: number, width: number, height: number];
              type: "pixmap";
              value?: string;
              zOrder?: number;
          }
        | {
              alignment?: "center" | "left" | "right";
              background?: string;
              color?: string;
              enabled?: boolean;
              font?: {
                  size?: number;
                  weight?: number;
              };
              key: string;
              opacity?: 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;
              rect: [x: number, y: number, width: number, height: number];
              "text-overflow"?: "clip" | "ellipsis" | "fade";
              type: "text";
              value?: string;
              zOrder?: number;
          }
    )[];
};
```

## Definitions
### Layout
Defines the structure of a custom layout file.
**Properties**
**id** : string[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#layout-id "Direct link to id")Required
Unique identifier associated with the layout.
**items** : ([Bar](/sdk/references/touch-strip-layout.md#bar), [GBar](/sdk/references/touch-strip-layout.md#gbar), [Pixmap](/sdk/references/touch-strip-layout.md#pixmap), [Text](/sdk/references/touch-strip-layout.md#text))[][](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#layout-items "Direct link to items")Required
Items within the layout.
### Bar
Bar layout item used to render a horizontal bar with a filler, e.g. a progress bar. The amount to fill the bar by can be specified by setting the `value`.
**Properties**
**background** : string[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#bar-background "Direct link to background")
Background color represented as a named color, hexadecimal value, or gradient. Gradients can be defined by specifying multiple color-stops separated by commas, in the following format `[{offset}:{color}[,]]`.
**Examples:**
  * "pink"
  * "#204cfe" (Elgato blue)
  * "0:#ff0000,0.5:yellow,1:#00ff00" (Gradient)


**enabled** : boolean[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#bar-enabled "Direct link to enabled")
Determines whether the item is enabled (i.e. visible); default is `true`.
**key** : string[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#bar-key "Direct link to key")Required
Unique name used to identify the layout item. When calling `setFeedback` this value should be used as the key as part of the object that represents the feedback.
Note: The `key` of the layout item cannot be changed at runtime.
**opacity** : 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#bar-opacity "Direct link to opacity")
Defines the opacity of the item being shown based on a single-decimal value ranging from `0..1`, e.g. `0.1`, `0.2`, etc. with `0` being invisible and `1` being fully visible. Default is `1`.
**rect** : [x: number, y: number, width: number, height: number][](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#bar-rect "Direct link to rect")Required
Array defining the items coordinates in the format `[x, y, width, height]`; coordinates must be within canvas size of 200 x 100, e.g. [0, 0, 200, 100]. Items with the same `zOrder` must **not** have an overlapping `rect`.
Note: The `rect` of the layout item cannot be changed at runtime.
**type** : "bar"[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#bar-type "Direct link to type")Required
Type of layout item this instance represents, e.g. "pixmap", "bar", etc.
Note: The `type` of the layout item cannot be changed at runtime.
**zOrder** : number[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#bar-zorder "Direct link to zOrder")
Z-order of the item, used to layer items within a layout; must be between 0-700. Items with the same `zOrder` must **not** have an overlapping `rect`. Default is `0`.
**bar_bg_c** : string[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#bar-bar_bg_c "Direct link to bar_bg_c")
Bar background color represented as a named color, hexadecimal value, or gradient. Default is `darkGray`. Gradients can be defined by specifying multiple color-stops separated by commas, in the following format `[{offset}:{color}[,]]`.
**Examples:**
  * "pink"
  * "#204cfe" (Elgato blue)
  * "0:#ff0000,0.5:yellow,1:#00ff00" (Gradient)


**bar_border_c** : string[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#bar-bar_border_c "Direct link to bar_border_c")
Border color represented as a named color, or hexadecimal value. Default is `white`.
**Examples:**
  * "pink"
  * "#204cfe" (Elgato blue)


**bar_fill_c** : string[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#bar-bar_fill_c "Direct link to bar_fill_c")
Fill color of the bar represented as a named color, hexadecimal value, or gradient. Default is `white`. Gradients can be defined by specifying multiple color-stops separated by commas, in the following format `[{offset}:{color}[,]]`.
**Examples:**
  * "pink"
  * "#204cfe" (Elgato blue)
  * "0:#ff0000,0.5:yellow,1:#00ff00" (Gradient)


**border_w** : number[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#bar-border_w "Direct link to border_w")
Width of the border around the bar, as a whole number. Default is `2`.
**range** : [Range](/sdk/references/touch-strip-layout.md#range)[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#bar-range "Direct link to range")
Defines the range of the value the bar represents, e.g. 0-20, 0-100, etc.
**subtype** : 0, 1, 2, 3, 4[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#bar-subtype "Direct link to subtype")
Sub-type used to determine the type of bar to render. Default is {@link BarSubType.Groove} (4).
**Options**
  * Rectangle (0)
  * DoubleRectangle (1)
  * Trapezoid (2)
  * DoubleTrapezoid (3)
  * Groove (4)


**value** : number[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#bar-value "Direct link to value")Required
Value used to determine how much of the bar is filled. Correlates with the item's `range` if specified in the layout's JSON definition; default range is `0..100`.
### GBar
Bar layout item used to render a horizontal bar with an indicator represented as a triangle beneath the bar. The location of the indicator can be specified by setting the `value`.
**Properties**
**background** : string[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#gbar-background "Direct link to background")
Background color represented as a named color, hexadecimal value, or gradient. Gradients can be defined by specifying multiple color-stops separated by commas, in the following format `[{offset}:{color}[,]]`.
**Examples:**
  * "pink"
  * "#204cfe" (Elgato blue)
  * "0:#ff0000,0.5:yellow,1:#00ff00" (Gradient)


**enabled** : boolean[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#gbar-enabled "Direct link to enabled")
Determines whether the item is enabled (i.e. visible); default is `true`.
**key** : string[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#gbar-key "Direct link to key")Required
Unique name used to identify the layout item. When calling `setFeedback` this value should be used as the key as part of the object that represents the feedback.
Note: The `key` of the layout item cannot be changed at runtime.
**opacity** : 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#gbar-opacity "Direct link to opacity")
Defines the opacity of the item being shown based on a single-decimal value ranging from `0..1`, e.g. `0.1`, `0.2`, etc. with `0` being invisible and `1` being fully visible. Default is `1`.
**rect** : [x: number, y: number, width: number, height: number][](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#gbar-rect "Direct link to rect")Required
Array defining the items coordinates in the format `[x, y, width, height]`; coordinates must be within canvas size of 200 x 100, e.g. [0, 0, 200, 100]. Items with the same `zOrder` must **not** have an overlapping `rect`.
Note: The `rect` of the layout item cannot be changed at runtime.
**type** : "gbar"[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#gbar-type "Direct link to type")Required
Type of layout item this instance represents, e.g. "pixmap", "bar", etc.
Note: The `type` of the layout item cannot be changed at runtime.
**zOrder** : number[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#gbar-zorder "Direct link to zOrder")
Z-order of the item, used to layer items within a layout; must be between 0-700. Items with the same `zOrder` must **not** have an overlapping `rect`. Default is `0`.
**bar_bg_c** : string[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#gbar-bar_bg_c "Direct link to bar_bg_c")
Bar background color represented as a named color, hexadecimal value, or gradient. Default is `darkGray`. Gradients can be defined by specifying multiple color-stops separated by commas, in the following format `[{offset}:{color}[,]]`.
**Examples:**
  * "pink"
  * "#204cfe" (Elgato blue)
  * "0:#ff0000,0.5:yellow,1:#00ff00" (Gradient)


**bar_border_c** : string[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#gbar-bar_border_c "Direct link to bar_border_c")
Border color represented as a named color, or hexadecimal value. Default is `white`.
**Examples:**
  * "pink"
  * "#204cfe" (Elgato blue)


**bar_fill_c** : string[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#gbar-bar_fill_c "Direct link to bar_fill_c")
Fill color of the bar represented as a named color, hexadecimal value, or gradient. Default is `white`. Gradients can be defined by specifying multiple color-stops separated by commas, in the following format `[{offset}:{color}[,]]`.
**Examples:**
  * "pink"
  * "#204cfe" (Elgato blue)
  * "0:#ff0000,0.5:yellow,1:#00ff00" (Gradient)


**border_w** : number[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#gbar-border_w "Direct link to border_w")
Width of the border around the bar, as a whole number. Default is `2`.
**range** : [Range](/sdk/references/touch-strip-layout.md#range)[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#gbar-range "Direct link to range")
Defines the range of the value the bar represents, e.g. 0-20, 0-100, etc.
**subtype** : 0, 1, 2, 3, 4[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#gbar-subtype "Direct link to subtype")
Sub-type used to determine the type of bar to render. Default is {@link BarSubType.Groove} (4).
**Options**
  * Rectangle (0)
  * DoubleRectangle (1)
  * Trapezoid (2)
  * DoubleTrapezoid (3)
  * Groove (4)


**value** : number[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#gbar-value "Direct link to value")Required
Value used to determine how much of the bar is filled. Correlates with the item's `range` if specified in the layout's JSON definition; default range is `0..100`.
**bar_h** : number[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#gbar-bar_h "Direct link to bar_h")
Height of the bar's indicator. Default is `10`.
### Pixmap
Image layout item used to render an image sourced from either a local file located under the plugin's folder, or base64 encoded `string`. The `value` defines the image.
**Properties**
**background** : string[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#pixmap-background "Direct link to background")
Background color represented as a named color, hexadecimal value, or gradient. Gradients can be defined by specifying multiple color-stops separated by commas, in the following format `[{offset}:{color}[,]]`.
**Examples:**
  * "pink"
  * "#204cfe" (Elgato blue)
  * "0:#ff0000,0.5:yellow,1:#00ff00" (Gradient)


**enabled** : boolean[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#pixmap-enabled "Direct link to enabled")
Determines whether the item is enabled (i.e. visible); default is `true`.
**key** : string[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#pixmap-key "Direct link to key")Required
Unique name used to identify the layout item. When calling `setFeedback` this value should be used as the key as part of the object that represents the feedback.
Note: The `key` of the layout item cannot be changed at runtime.
**opacity** : 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#pixmap-opacity "Direct link to opacity")
Defines the opacity of the item being shown based on a single-decimal value ranging from `0..1`, e.g. `0.1`, `0.2`, etc. with `0` being invisible and `1` being fully visible. Default is `1`.
**rect** : [x: number, y: number, width: number, height: number][](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#pixmap-rect "Direct link to rect")Required
Array defining the items coordinates in the format `[x, y, width, height]`; coordinates must be within canvas size of 200 x 100, e.g. [0, 0, 200, 100]. Items with the same `zOrder` must **not** have an overlapping `rect`.
Note: The `rect` of the layout item cannot be changed at runtime.
**type** : "pixmap"[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#pixmap-type "Direct link to type")Required
Type of layout item this instance represents, e.g. "pixmap", "bar", etc.
Note: The `type` of the layout item cannot be changed at runtime.
**zOrder** : number[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#pixmap-zorder "Direct link to zOrder")
Z-order of the item, used to layer items within a layout; must be between 0-700. Items with the same `zOrder` must **not** have an overlapping `rect`. Default is `0`.
**value** : string[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#pixmap-value "Direct link to value")
Image to render; this can be either a path to a local file within the plugin's folder, a base64 encoded `string` with the mime type declared (e.g. PNG, JPEG, etc.), or an SVG `string`.
**Examples:**
  * "imgs/Logo.png"
  * "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MHB0IiBoZWlnaHQ9…"


### Range
Defines the range of the value the bar represents, e.g. 0-20, 0-100, etc.
**Properties**
**min** : number[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#range-min "Direct link to min")Required
Minimum value of the bar.
**max** : number[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#range-max "Direct link to max")Required
Maximum value of the bar.
### Text
Text layout item used to render text within a layout. **Note** , when adding a text item to the layout's JSON definition, setting the `key` to the `"title"` keyword will enable the user to specify the font's settings via the property inspector, and will cause `setTitle` to update this item.
**Properties**
**background** : string[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#text-background "Direct link to background")
Background color represented as a named color, hexadecimal value, or gradient. Gradients can be defined by specifying multiple color-stops separated by commas, in the following format `[{offset}:{color}[,]]`.
**Examples:**
  * "pink"
  * "#204cfe" (Elgato blue)
  * "0:#ff0000,0.5:yellow,1:#00ff00" (Gradient)


**enabled** : boolean[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#text-enabled "Direct link to enabled")
Determines whether the item is enabled (i.e. visible); default is `true`.
**key** : string[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#text-key "Direct link to key")Required
Unique name used to identify the layout item. When calling `setFeedback` this value should be used as the key as part of the object that represents the feedback.
Note: The `key` of the layout item cannot be changed at runtime.
**opacity** : 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#text-opacity "Direct link to opacity")
Defines the opacity of the item being shown based on a single-decimal value ranging from `0..1`, e.g. `0.1`, `0.2`, etc. with `0` being invisible and `1` being fully visible. Default is `1`.
**rect** : [x: number, y: number, width: number, height: number][](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#text-rect "Direct link to rect")Required
Array defining the items coordinates in the format `[x, y, width, height]`; coordinates must be within canvas size of 200 x 100, e.g. [0, 0, 200, 100]. Items with the same `zOrder` must **not** have an overlapping `rect`.
Note: The `rect` of the layout item cannot be changed at runtime.
**type** : "text"[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#text-type "Direct link to type")Required
Type of layout item this instance represents, e.g. "pixmap", "bar", etc.
Note: The `type` of the layout item cannot be changed at runtime.
**zOrder** : number[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#text-zorder "Direct link to zOrder")
Z-order of the item, used to layer items within a layout; must be between 0-700. Items with the same `zOrder` must **not** have an overlapping `rect`. Default is `0`.
**alignment** : "center", "left", "right"[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#text-alignment "Direct link to alignment")
Alignment of the text. Default is `"center"`. **Note** , when the `key` of this layout item is set to `"title"` within the layout's JSON definition, these values will be ignored in favour of the user's preferred title settings, as set in property inspector.
**color** : string[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#text-color "Direct link to color")
Color of the font represented as a named color, or hexadecimal value. Default is `white`. **Note** , when the `key` of this layout item is set to `"title"` within the layout's JSON definition, these values will be ignored in favour of the user's preferred title settings, as set in property inspector.
**Examples:**
  * "pink"
  * "#204cfe" (Elgato blue)


**font** : object[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#text-font "Direct link to font")
Defines how the font should be rendered. **Note** , when the `key` of this layout item is set to `"title"` within the layout's JSON definition, these values will be ignored in favour of the user's preferred title settings, as set in property inspector.
**Properties**
**size** : number[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#text-font-size "Direct link to size")
Size of the font, in pixels, represented as a whole number.
**Note** , when the `key` of this layout item is set to `"title"` within the layout's JSON definition, this value will be ignored in favour of the user's preferred title settings, as set in property inspector.
**weight** : number[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#text-font-weight "Direct link to weight")
Weight of the font; value must be a whole `number` in the range of `100..1000`. **Note** , when the `key` of this layout item is set to `"title"` within the layout's JSON definition, this value will be ignored in favour of the user's preferred title settings, as set in property inspector.
**text-overflow** : "clip", "ellipsis", "fade"[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#text-text-overflow "Direct link to text-overflow")
Defines how overflowing text should be rendered on the layout.
  * clip, truncates the text at the boundary of the element (default).
  * ellipsis, truncates the text prior to the boundary of the element, and adds an ellipsis (…) to the end.
  * fade, applies a fade-gradient over the end of the text.


**value** : string[](https://docs.elgato.com/streamdeck/sdk/references/touch-strip-layout/#text-value "Direct link to value")
Text to be displayed.