---
type: Guide
title: "Distribution"
description: "In this article you'll learn about preparing and packaging your plugin ready for publishing on Marketplace."
resource: https://docs.elgato.com/streamdeck/sdk/introduction/distribution/
tags: [distribution, packaging]
timestamp: 2026-07-11T20:01:18.319908+09:00
---

# Distribution
In this article you'll learn about preparing and packaging your plugin ready for publishing on Marketplace.
## Overview
Plugins are packaged into `.streamDeckPlugin` files using the [Stream Deck CLI](../cli/cli-intro.md), and once packaged, contain everything your plugin needs to be distributed on Marketplace, or directly to users.
Below of an overview of creating a Stream Deck plugin, through to Marketplace.
![A flow diagram that indicates how a Stream Deck plugin is published, with the steps, 'Create', 'Pack', 'Upload' to Maker Console, 'Review', and then 'Publish' to Marketplace. The flow diagram highlights that plugins are DRM protected after they have been uploaded to Maker Console.](https://docs.elgato.com/img/streamdeck/sdk/plugin-distribution-overview.svg)
## DRM Protection
Plugins distributed on Marketplace are eligible for DRM (Digital Rights Management), providing you and your intellectual property with an extra level of protection.
Benefits on DRM protection also include:
  * **File Encryption** — Prevent unauthorized vendors from executing your plugin without your consent.
  * **Integrity Checking** — Protect users from tampered files, with built-in file integrity verification.
  * **New SDK Features** — Unlock new Stream Deck SDK features.

info
Plugins created with Stream Deck CLI 1.6 or higher have DRM enabled as default; to check your CLI version run `streamdeck -v`, and update by running:
Update Stream Deck CLI

```
npm install -g @elgato/cli@latest
```

### Compatibility & Readiness
The following set of criteria are pre-requisites for DRM protection, and it is important they are reviewed before enabling DRM protection.
**Node.js SDK** — Node.js plugins must be using `@elgato/streamdeck` v2 or higher. [Learn more](../sdk/upgrading-v2.md).
**File Integrity** — Files distributed in your plugin are immutable.
  * Do:Generate required files at runtime.
  * Don't:Modify files after they have been distributed in your plugin.

**Manifest** — Your plugin's manifest is a protected asset.
  * Do:
Include a separate JSON file, or embed directly into your codebase, additionally required non-sensitive information.
  * Don't:Access the manifest JSON file at runtime.

tl;dr
  * Node.js plugins must be using `@elgato/streamdeck` v2 or higher.
  * Files distributed with your plugin are immutable.
  * Your plugin's manifest cannot be accessed at runtime.

SDK compatibility
DRM protection is available to all Stream Deck SDK libraries, such as C#, C++, and Go, and is not limited to Node.js.
### Enabling DRM
After reviewing compatibility, to enable DRM:
  1. Update to `@elgato/streamdeck` v2 or higher (Node.js plugins only). [Learn more](../sdk/upgrading-v2.md).
  2. In your manifest
    1. Set [`UUID`](../sdk/manifest.md#manifest-uuid) to your plugin's identifier, e.g. `com.elgato.wave-link`.
    2. Update [`SDKVersion`](../sdk/manifest.md#manifest-sdkversion) to be `3`.
    3. Update [`Software.MinimumVersion`](../sdk/manifest.md#software-minimumversion) to be `"6.9"` or higher.

Caution
Plugins with DRM enabled are only protected **after** they have been uploaded and processed in Maker Console. [Learn more about accessing a DRM protected version of your plugin](distribution.md#testing-with-drm).
### Testing with DRM
Plugins with DRM enabled are only protected **after** they have been uploaded and processed in Maker Console.
On occasion, you may need to access the DRM protected version of your plugin before publishing it to users, for example when you want to:
  * Distribute a beta version to testers.
  * Test your plugin is DRM compatible.

To prepare and access a DRM protected version of your plugin.
  1. Log in to [Maker Console](https://maker.elgato.com).
  2. Upload your plugin, with "Publish after review" unselected.
  3. Navigate to your product's page in Maker Console.
  4. Select the "Versions" tab.
  5. Select the new version of your plugin.
  6. Download the DRM protected version.

## Packaging
When your plugin is ready for distribution, you can package it into a `.streamDeckPlugin` installer file using the Stream Deck CLI's [`pack`](../cli/streamdeck-pack.md) command.
Example of packaging a plugin

```
# Pack the *.sdPlugin directory
streamdeck pack com.elgato.hello-world.sdPlugin
```

Running the `pack` command does the following
  1. Validates your plugin and supporting files.
     * See also [`validate`](../cli/streamdeck-validate.md).
  2. Bundles the contents of the `*.sdPlugin` directory.
  3. Outputs the `.streamDeckPlugin` installer file.

Ignoring files
When packaging your plugin, you can ignore files by specifying paths, using `.gitignore` specification, within a `.sdignore` file. [Learn more about ignoring files when packaging](../cli/streamdeck-pack.md#description).
## Publishing
Marketplace provides a platform for your plugin, and allows you to reach millions of Stream Deck users by making your plugin discoverable within the catalog of Stream Deck plugins.
[![Get it on Marketplace](https://docs.elgato.com/img/badges/get-it-on-marketplace--dark.svg) ](https://marketplace.elgato.com/stream-deck/plugins)
To publish on Marketplace, you should follow these steps:
  1. [Review plugin guidelines](plugin-guidelines.md) — Make sure your plugin conforms to Stream Deck and Marketplace style guidelines.
  2. [Create an app icon](https://docs.elgato.com/guidelines/products) — Create an eye-catching app icon.
  3. [Create gallery items](https://docs.elgato.com/guidelines/products) — Showcase your plugins functionality.
  4. [Submit for review](https://maker.elgato.com) — Submit, manage, and review your products using Maker Console.

You can also learn more about submitting products to Marketplace in [Become a Maker](become-a-maker.md).
Returning Makers
Returning Maker? After creating an account within Maker Console, if you are unable to see your plugins, please contact our Maker Relations team on maker@elgato.com.
