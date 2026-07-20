---
type: UI Component Reference
title: "Password"
description: "The <sdpi-password> component provides a styled wrapper of <input type=\"password\">."
resource: https://sdpi-components.dev/docs/components/password
tags: [sdpi-components, component, password]
timestamp: 2026-07-11T20:01:18.352498+09:00
---

# Password
The `<sdpi-password>` component provides a styled wrapper of [`<input type="password">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/password).
## Example
Property Inspector HTML

```
<sdpi-item label="Password">      
    <sdpi-password setting="api_key"></sdpi-password>  
</sdpi-item>  

```

#### Result
![A password field input in the Stream Deck property inspector using the sdpi-password web component](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAeQAAABqCAMAAABavdLXAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAK7UExURS0tLTMzMzs7O0BAQENDQ0ZGRkdHRy4uLjo6OkVFRTY2NkRERDs9QCkuNRkhLBMbKA0WJAoUIz4+Pjg6PhgfKz09PSUqMxwjLgsUIxMaJRcdJR0hJyAjJwsVIxQbJRsfJh4iJyIkKA8YJB4hJw4XJBIZJR8iJzk5ORUbJSEjJy47Vz1u4DVVnxUcJTdcsRIZJJCQkJaWlri5ui8/ZWlpaWxsbI6OjiguPiw2Tunq7TdaqzdZqC04Uyo0SCQoMEFBQYSEhCs1SzRPjjJIfEhTbIeOny46ViUrNn+Bgy1BZIaGZEEtLTA8WDFFczA/ZGx0iejp7JKYp46UouXm5lpcXy0tQWSGloZtbTIyMmZmZmJiYjU1Nbq+xejp6ubn57W2t2hqbefn6JGWooyTo+fo7GRnb7a2tnp6enFxcbm5uUtLSygvPufo6GhpbMDEy0EtQYaWlpaWhmRBLYaWhk1NTVJSUiMmLBgdJRsgJ+bn6igvQBsgJkEtU3WWdVMtLTlAT0FBZJaWdZycnDBDbbS1trCwsDljwy46WBEZJIaWdXWWlnVTLTQ0NFN1lpaGZCAjKD1s3BQaJSU5ZSNBgm2Mmpqamn5VLYxtQS1VfpqaflUtLS0tVX6ajG1BLVV+mpp+VUFtjJqMbZqajH5+fpqMfn6Mmn6aflVVVS1BbYyafm1BVW1+fn5+bVUtQYyamj09lLrY2NjYupQ9PT1yrM7Y2NjOrHI9PXKsztjY2M6scpS62LqUPbnX2HKszUFBbYx+VVV+fm2MjG1BQT2UutjYzqxycqzO2HI9lNi6lHKUutfY2D6UuqxylH6amlVVfn5tbYyMbQ8dNSlKlX5VVYyMjH6MjDxs2yI+ew0ZLzhlziI/fW1tfjNcuwsWKBUpTjNcuRovWyI9eg0ZLgoVJTBYsDxr2hkuWi1SpBMjQ09dQAcAAAAJcEhZcwAADr8AAA6/ATgFUyQAAAdqSURBVHhe7Z2HdxRFHMcvIdkLgTRqQmJCBAK5ExU1IFhAUBSCEEvsxoYIIoKIolGxK1ZUUiA9qBgLigWJYgN7QbGBKBbE9mf4m9nvJnfc7bG3N5e72/t93svtzO7svPebT6bs3ns3LoZhGIZhGIZhGIZhGIZhGIZhGIZhGJWkpPZLS9fCIj2tX2oKbmfiHndGf4gLm/4ZblTCxDWZA2DMFgMyUQ0Tv7hThaqBWdk5uXlhkZuTnTVQ3MudOe4ZRJoGD4G4sBkymG4f1JeWhzofRKoO6sfpw2DMFsNovZaByvoCNISTQaTKyCTHw6HLJsPJch/Oy2gIJ4NIVeGmNZfej/MLRhQWFY4oOEzmDkF+ccnI0pElxfkyN4xWX303YKMhnAwiVUUGzcdS1OGjSnVGjZb5kIwpQ+GyMTJP8/JYVBh90BBOBpGqgp6P5ZprXLluzePxlI8TJ7xerzgETRzh0QsLxoszQ+h5GRVGHzSEk0GkikihZydhaTQcC8ml5aIvh5B8JJXp5Shxip6k+uzdFxrCySBSf46eYIATVqGldRY5ysdYfYyUXDqK5mVzyfnH+kkeKeblLE1LRZVRBw3hZBCpP8dVVFRMnEgfFThhlX6alk2OCqSuScdPJseCKSTUlBP0MieedLK8q7SYKsjWtKmoMuqgIZwMIg1k2jQkwiFN03LI0Qgh6xSPx5A8HT6DMoMKnHoafcw8/YzBdF8JVZCjaWmoUh2zZlci5Qcawskg0kBsSaYnXPEus5BcTZozZ85k+hOSz4TPoMylAvOqzqLPs885l24sowpy6WkbVUZE9Xly0jl/diUZZskB+Ei+4EIkLroYCTM0TSNFeUXk6pKqqqpLa2pqLqN0kThphlyjXX7FlZ6r5l8tkuXiJFWEKiMFallyMHwkawuukceFi66VR3MgWfTkmR7P4uuENKJQnDRDf0ZeUnP9/HmLRUr0ZMWSZ81eSl1a9OdlE25Y7pp143JcFKAhnAwiDcR3uF4hLS9cdJOeNQeSxZxMw+/NhuSV4qQZt+hlltw6z1MrEreJk6ol68P17XeskmmWDPzmZGHZgmNDcoGYiOnByJBcIE6aUYxCd8p7auXqOkqS71pGE/Tdq3AFoCGcDCINxH/htWLBPRYcG5Lz75XCSu/T9YnnZHPy8U6zVt5TWybfX0dJcrBZGQ3hZBBpIP6SXSvut+DYkJz3wINSso584xWC1XoxSF4tz6mX/NAqGq4ffkSe4uEaHCTZ9SiOITEk540r75Gsv7sOxXhZjiTTnCzfXUdBsusxLLwmPM5zcg8HS7ZEj+S80TRiS3dWvoVavQaS1+j9WKXkQ4KGcDKINJAIJec9MWV6YVHhSovfJz9ZUlY7d8ZT+vfJBEtWCSJVhI9kr/FFhFXWer1rkWTJakGkimDJcQkiVQRLjksQqSIMyeKLBxuSCXhmySpBpIpgyXEJIlVEIkpmwsSQTNiRHJM5mQkTlpwEsOQkgCUnASw5CWDJSYAhmQzbkUzAM0uOX1hyEsCSkwBDMmFHMs/JiQBLTgJYchLAkpOARJSMr+OcDCJVBEuOSxCpIgzJZNiOZAKeWbJKEKkiWHJcgkgVwZLjEkSqCEMyYUcyz8nRAZEqgiXHJYhUESw5LkGkioiR5Oq6eqIBudBU1x1UDg3hZBCpImImudHlWre+CdmQsORIiaXk5pbWdbI/t9XXt7s66us7l5LPtkZXRzv19A2t1XVPb2htq3/m2Ybmjb7/DmgIJ4NIFWFIJsN2JBPwbK8nP+cio13PNzW3vNBCUhtI74svVbY1trXT1U114rOp6+UgPfmVza++9vobW97c2v3W0Le7t/lkza/I7Dt69l3/q0EKUla2d0xApIqImWTMydSVRbdtd1F37qx0ret87/0PNm3fQT26uWUH/SeQ7aDD9Yfd3du2dn/08SfdWz7d3P2ZT/Zz0ysy+4Vf9kv96ldBClJWtndMQKSKiGVPFofOyg4S3LyThJPrxuaNXzd0fLNLDNuhJZv3V/MrSd+TCRL2LZLW+C7COVkcGqrr2rt2VVbXfU/Tbltj9fYfWrt+bBduxXDdaDpcOxxEqggfybu93j1IWuKnvV7vz0jblEyrrQ2/UGcWCy8auGm87ljf1LxT9mqx8KJCvPCKHB/J+7ze3Xss9+Vff/uduv4fyIUrOSLQEE4GkSrCR/J+OcWGxd4/cS9LVgsiVQR+Cllw4C+os8zf/+BWdT+FbAU0hJNBpIrAj5pLDuzfR/OyZfb++x9uJKLyo+YmoCGcDCJVBLYn6IXsWU/0wtsTKAWRKgIbjfRiUzJvNKIURKoIY8ugHmxK5i2DlIJIVWFs/hUZvPmXWhCpKnq28YsI3sZPLYhUFb0bckYAb8ipGESqDEVb6x5q2xompiTcJtlM+LgTbbt7xgZuWnzRk1RWdo7xhtMiuTnZWfTsRI/I7Dj+yaTVl30G8HycELjH0vOyPfqP5W6cMKSkTk2jFVQ4pKdNTe2z91wMwzAMwzAMwzAMwzAMwzAMwzAMwzBM9HC5/gfQ00khKHreLwAAAABJRU5ErkJggg==)
value
The value of the component is represented as a `string`.

```
{  
    "api_key": "top secret, shh"  
}  

```

## Configuration
The component supports the following configuration.  
| Name  | Type  | Description  |  
| --- | --- | --- |  
| `disabled`  | `boolean`  | Determines whether the input is disabled.  |  
| `maxlength`  | `number`  | Optional maximum length of the value.  |  
| `placeholder`  | `string`  | Optional placeholder text shown in the input.  |  
| `required`  | `boolean`  | When present, an icon is shown in the input if the value is empty.  |  
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
