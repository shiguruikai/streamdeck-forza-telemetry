---
type: Guide
title: "Get Started"
description: "Getting started is easy; simply download the latest version of sdpi-components.js and reference the file within your property inspector. Property Inspector HTML"
resource: https://sdpi-components.dev/docs/getting-started/get-started
tags: [sdpi-components, ui, getting-started]
timestamp: 2026-07-11T20:01:18.358038+09:00
---

# Get Started
Getting started is easy; simply download the latest version of [sdpi-components.js](https://sdpi-components.dev/releases/v4/sdpi-components.js) and reference the file within your property inspector.
Property Inspector HTML

```
<script src="sdpi-components.js"></script>  

```

tip
If you prefer to learn by example, check out the [example in the repository](https://github.com/GeekyEggo/sdpi-components/blob/main/example/pi/index.html).
## Example
Property Inspector HTML

```
<!DOCTYPE html>  
<html>  
    <head lang="en">  
        <meta charset="utf-8" />  
        <script src="sdpi-components.js"></script>  
    </head>  
    <body>  
        <sdpi-item label="Name">  
            <sdpi-textfield setting="name"></sdpi-textfield>  
        </sdpi-item>  
  
        <sdpi-item label="Show Name">  
            <sdpi-checkbox setting="show_name"></sdpi-checkbox>  
        </sdpi-item>  
  
        <sdpi-item label="Favorite Color">  
            <sdpi-select setting="fav_color" placeholder="Please choose a color">  
                <option value="red">Red</option>  
                <option value="green">Green</option>  
                <option value="blue">Blue</option>  
            </sdpi-select>  
        </sdpi-item>  
    </body>  
</html>  

```

#### Result
![An example of a property inspector using the sdpi-components library](data:image/png;base64,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)
Settings
Given the above example, the resulting settings would have the following structure

```
{  
    "name": <string>,  
    "show_name": <true | false>,  
    "fav_color": <"red" | "green" | "blue">  
}  

```

info
The path to the Property Inspector file must be defined in your plugin's `manifest.json`. Read more about this on [Elgato's Developer Documentation](../sdk/manifest.md).
