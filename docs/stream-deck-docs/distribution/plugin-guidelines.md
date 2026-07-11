---
type: Guidelines
title: "Plugin Guidelines"
description: "The following style guide outlines the guidelines that your Stream Deck plugin's metadata must conform to when publishing on Marketplace. In doing so, it ens..."
resource: https://docs.elgato.com/guidelines/stream-deck/plugins/
tags: [distribution, guidelines, marketplace]
timestamp: 2026-07-11T20:01:18.276303+09:00
---

# Plugin Guidelines
The following style guide outlines the guidelines that your Stream Deck plugin's metadata must conform to when publishing on Marketplace. In doing so, it ensures an inclusive, consistent, and good user-experience for Stream Deck users.
On this page, you'll learn more about:
  * Guidelines for defining the metadata associated with your plugin.
  * Image dimensions and requirements.
  * General best practices, such as providing visual feedback.

Change requests
We, Elgato, reserve the right to request changes to your product to ensure it conforms the necessary guidelines. Failure to do so may result in your Marketplace submission being declined, or your product being removed from Marketplace. 
## UUIDs
Universally unique identifiers (UUIDs) are used by Stream Deck and Marketplace to identify:
  * Your [plugin](../sdk/manifest.md#manifest-uuid).
  * [Actions](../sdk/manifest.md#action-uuid) within your plugin.

Requirements
  * include author (organization name) and plugin name in your plugin UUID — for example `com.elgato.volume-controller`.
  * prefix action UUIDs with your plugin UUID — for example `com.elgato.volume-controller.mute-audio-device`.

  * change UUIDs after publishing your plugin.

Recommendations
  * reverse DNS format — consider using the format `{DOMAIN}.{PRODUCT}`, for example `com.elgato.wave-link`.
  * [`VisibleInActionsList`](../sdk/manifest.md#action-visibleinactionslist) — prefer cloning actions, and hiding older implementations instead of changing action UUIDs.

## Plugin
### Name
Your plugin's name is a word, or short phrase, that uniquely identifies your plugin and the functionality it provides.
Requirements
  * use a unique name — check your name is available on [Marketplace](https://marketplace.elgato.com/stream-deck/plugins).
  * accurately reflect the functionality provided by your plugin.

  * infringe copyright or trademarks.
  * use derogatory or offensive vocabulary.

Recommendations
  * descriptive and concise — for example "Volume Controller", "Screen Capture", "Color Picker", etc.
  * memorable and easy to pronounce.

  * organization name — avoid including your organization name in your plugin's name; organization is already visible on Marketplace.

### Author
The [`Author`](../sdk/manifest.md#manifest-author) field within the manifest uniquely identifies you, or your organization, as the creator of the plugin, and is visible within Marketplace and Stream Deck.
Requirements
  * use your Marketplace organization name.
  * use company name where applicable — for example "Elgato".
  * use your real name, if you wish too — for example "Jane Doe".
  * use your online alias, if you wish too — for example "jdodo".

  * infringe copyright or trademarks.
  * use derogatory or offensive vocabulary

### Icon
Your plugin's [icon](../sdk/manifest.md#manifest-icon), visible within Stream Deck preferences pane, must adhere to the following guidelines.
#### Sizing
!Plugin icon, 256 × 256 px and 512 × 512 px (high DPI).
Requirements
  * use PNG format.
  * accurately portray what your plugin does.

  * infringe copyright.
  * use offensive imagery.

## Actions List
### Naming
Your plugin's [category](../sdk/manifest.md#manifest-category) and [action names](../sdk/manifest.md#action-name) must accurately represent their functionality, and be sufficiently descriptive but concise (approximately 30 characters or less).
!
Requirements
  * specify the [category](../sdk/manifest.md#manifest-category).
  * use the same, or similar, values for plugin [name](../sdk/manifest.md#manifest-name) and [category](../sdk/manifest.md#manifest-category).

  * include author names in category, for example "Camera Controls (John Doe)".
  * use derogatory or offensive vocabulary.

Recommendations
  * specify action [tooltips](../sdk/manifest.md#action-tooltip).
  * "Volume Controller", "Mute Audio Device" — descriptive and concise names.
  * "Twitch Mod Controls" — descriptive without infringing copyright exclusivity.

  * "Moderator Controls for Streaming" — too vague, and more than 30 characters.
  * "Toggle Chat Mode And Send Message" — should be two separate actions.
  * "Elgato Wave Link" — omit organization when also the author, prefer "Wave Link".

### Icons
[Category](../sdk/manifest.md#manifest-categoryicon) and [action](../sdk/manifest.md#action-icon) icons within the action list supports both vectorized (SVG) and rasterized (PNG) image files, with SVG being the recommended format to provide optimal scaling.
#### Sizing
!Category icon, 28 × 28 px — and 56 × 56 px (high DPI) when using rasterized images. !Action icon, 20 × 20 px — and 40 × 40 px (high DPI) when using rasterized images.
Requirements
  * use SVG or PNG format.
  * use monochromatic color scheme, with a transparent background.
  * provide high-DPI variants when using rasterized images (PNG). 
  * use white stroke, `#FFFFFF`, for action list icons.

!Good — Monochromatic category icon with white stroke.!Good — Monochromatic action icon with white stroke; auto-adjusted by Stream Deck.
  * use colors to style action list icons.

!Bad — Action lists icons with color.
  * use solid backgrounds on action list icons. 

!Bad — Action list icons with a solid background.
Recommendations
  * SVG — scale well on all devices and layouts. 

  * PNG — rasterized images may not scale well.

### Grouping
When determining the actions provided by your plugin, you should aim to provide an array of functionality that adds value to your plugin, without overwhelming the user.
Recommendations
  * combine actions — actions with common settings should be consolidated, and have a property inspector for configuring them. 

!Good — Consolidate actions that share settings
  * provide a reasonable amount of functionality, between 2 and 30 actions, no more.

  * avoid static actions that aren't configurable.

!Bad — Avoid static actions
## Key Icons
[Key icons](../sdk/manifest.md#state-image), represented as state images within the manifest, can be vectorized (SVG) or rasterized (PNG) images, with SVG being the recommended format to provide optimal scaling.
In addition to static images, animated (GIF) images may also be specified within the manifest, but cannot be used when programmatically updating actions.
### Sizing
!Key icon, 72 × 72 px — and 144 × 144 px (high DPI) when using rasterized images.
Updating programmatically
When updating key icons programmatically only one image size can be supplied. For rasterized images, it is recommended to provide an image that uses the higher DPI dimensions; Stream Deck will scale the image down accordingly.
Requirements
  * use SVG, PNG, or GIF format. 
  * use [states](../sdk/manifest.md#state-image) effectively — update icons when a state associated with the action changes, for example the associated smart light is turned on / off. 

Recommendations
  * SVG — vectorized images allow you to provide visually appealing dynamic keys, for example charts and meters.
  * positional awareness — consider grouping actions based on their coordinates to provide new levels of interactions.

!Good — Volume Controller's action act as an interactive slider when actions are paired together.
  * programmatic flooding — keys are not intended for rendering high frame rate videos; limit programmatic calls to a _maximum_ of 10 per second. 

## Layouts
Touch strip [layouts](../sdk/dials-and-touch-strip.md#layouts) found on Stream Deck + support providing rich feedback in the form of elements, and allow for touch and hold interaction. The following should be considered when using layouts. 
### Sizing
!Touch strip layout, 200 × 100 px
Layout boundary
All elements within a layout must be within the bounds of the layout; if an element exceeds the bounds, the layout will fail to load.
Requirements
  * use accessible touch size — interactive elements should be accessible, and have a touch size of at least 35 × 35 px. 

Recommendations
  * [built-in layouts](../sdk/dials-and-touch-strip.md#built-in-layouts) — where suitable, consider using pre-defined layouts.
  * partial updates — utilize elements effectively to update portions of layouts.
  * responsive — elements should update promptly when the state associated with the

  * lots of touchable elements — space on the touch strip is limited, and cramped elements can be difficult for users with accessibility requirements.
  * programmatic flooding — touch strips are not intended for rendering high frame rate videos; limit programmatic calls to a _maximum_ of 10 per second.

## Temporary Feedback
Stream Deck SDK enables your plugin to provide feedback to the user when an action (or operation) succeeds or fails. 
Requirements
  * use [`showAlert`](../sdk/keys.md#showalert) to inform the user when an action was unsuccessful. Also applicable to [dials](../sdk/dials-and-touch-strip.md#showalert).

Recommendations
  * use [`showOk`](../sdk/keys.md#showok) to inform the user of success when there is no visual indicator, for example a file was written or request was sent. 

  * duplicate success indicators — for actions that have visual indication of success, for example a light changing and the action's state updating, `showOk` is unnecessary. 

Logging
Use [logging](../sdk/logging.md) to record information, specifically when issues occur, to assist with diagnosing potential problems.
## Property Inspectors (UI)")
Property inspectors within your Stream Deck plugin play an integral role in allowing users to configure and customize your plugin's actions. Property inspectors must adhere to the following guidelines. 
Requirements
  * use checkbox for boolean settings.
  * use select or radio for single-select settings.
  * provide validation feedback.
  * automatically save settings on change.
  * provide setup help — where necessary, provide links to support pages.

  * include donation or sponsor links — prefer "Additional Links" in your product's page on Marketplace.
  * list copyright — prefer description, or "Additional Links", in your product's page on Marketplace.
  * have a "Save" button for action settings.

Recommendations
  * hidden by default — to prevent flickering, when using a single property inspector file, hide components by default, and show only necessary components on DOM ready.

  * complex configuration — avoid using _"lots"_ of components; prefer splitting the action into smaller actions if necessary.
  * large paragraphs — space is limited, and should be reserved for configuration.

  * [UUIDs](plugin-guidelines.md#uuids)
  * [Plugin](plugin-guidelines.md#plugin)
    * [Name](plugin-guidelines.md#name)
    * [Author](plugin-guidelines.md#author)
    * [Icon](plugin-guidelines.md#icon)
  * [Actions List](plugin-guidelines.md#actions-list)
    * [Naming](plugin-guidelines.md#naming)
    * [Icons](plugin-guidelines.md#icons)
    * [Grouping](plugin-guidelines.md#grouping)
  * [Key Icons](plugin-guidelines.md#key-icons)
    * [Sizing](plugin-guidelines.md#sizing-2)
  * [Layouts](plugin-guidelines.md#layouts)
    * [Sizing](plugin-guidelines.md#sizing-3)
  * [Temporary Feedback](plugin-guidelines.md#temporary-feedback)
  * [Property Inspectors (UI)](plugin-guidelines.md#property-inspectors-ui)
