---
type: UI Component Reference
title: "Textfield"
description: "The <sdpi-textfield> component provides a styled wrapper of <input type=\"text\">."
resource: https://sdpi-components.dev/docs/components/textfield
tags: [sdpi-components, component, textfield]
timestamp: 2026-07-11T20:01:18.356942+09:00
---

# Textfield
The `<sdpi-textfield>` component provides a styled wrapper of [`<input type="text">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/text).
## Example
Property Inspector HTML

```
<sdpi-item label="Textfield">  
    <sdpi-textfield  
        setting="first_name"  
        pattern="/^[a-z ,.'-]+$/i"  
        placeholder="First name"  
        required>  
    </sdpi-textfield>  
</sdpi-item>  

```

#### Result
![A text field input in the Stream Deck property inspector using the sdpi-textfield web component](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAeQAAABqCAMAAABavdLXAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAK7UExURS0tLTMzMzs7O0BAQENDQ0ZGRkdHRy4uLjo6OkVFRTY2NkRERDs9QCkuNRkhLBMbKA0WJAoUIz4+Pjg6PhgfKz09PSUqMxwjLgsUIxMaJRcdJR0hJyAjJwsVIxQbJRsfJh4iJyIkKA8YJB4hJw4XJBIZJR8iJzk5ORUbJSEjJy47Vz1u4DVVnxUcJTdcsRIZJJCQkJaWlri5ui8/ZWlpaWxsbI6OjiguPiw2Tunq7TdaqzdZqC04Uyo0SCQoMEFBQYSEhCs1SzRPjjJIfEhTbIeOny46ViUrNn+Bgy1BZIaGZEEtLTA8WDFFczA/ZGx0iejp7JKYp46UouXm5lpcXy0tQWSGloZtbTIyMmZmZmJiYjU1Nbq+xejp6ubn57W2t2hqbefn6JGWooyTo+fo7GRnb7a2tnp6enFxcbm5uUtLSygvPufo6GhpbMDEy0EtQYaWlpaWhmRBLYaWhk1NTVJSUiMmLBgdJRsgJ+bn6igvQBsgJkEtU3WWdVMtLTlAT0FBZJaWdZycnDBDbbS1trCwsDljwy46WBEZJIaWdXWWlnVTLTQ0NFN1lpaGZCAjKD1s3BQaJSU5ZSNBgm2MmpqamoxtQUFtjJp+VS1BbYyampqajoeOmn5VLYyaflUtLVV+mj1FV2x1dXV1dWNORVdsdWNOPWx1Y049PYqKirGxsdjY2Jqafi1Vfi0tVX6amox9g35ufoxtUZqMfn6Mmn6afmx1bFdFPT1OY3V1Y7u7u7q6un6ajG1BLT09RXVsY2NsdXVjTkVXbHVsV0U9TmN1dXVjY2xXRWNXVz09TnV1bJqMbWN1bEVOTkU9PUU9RU49RU5jdU49Tg8dNSlKlTxs2yI+ew0ZLzhlziI/fWN1YzNcuwsWKBUpTjNcuRovW2NjYyI9eg0ZLgoVJTBYsDxr2hkuWi1SpBMjQwJgFZMAAAAJcEhZcwAADsEAAA7BAbiRa+0AAAflSURBVHhe7Z2JV1RVHMcHhAFRNhUFIZBUlJmsrNC0RdOyFFNaaI82M80sM9uobC9brXRYLBMkFB3FdsDKAjJcirTSLNvMtj+j373v+4ARBt487sCbN7/POczcd3nvnvO7n/m9e++bc+Y6GIZhGIZhGIZhGIZhGIZhGIZhGIZhVBIROSAq2hkQ0VEDIiNwOWN5YmIHQlzADIyNQSOMpYkbBGOmGBSHZhjrEhMpVA2OT0hMSg6IpMSE+MHiWk5myzOENA0dBnEBM2woXT6kLy2n2B9Eqg7K4+jhMGaK4TRfi0VjfQE6ws4gUmXEkeMR0GWSEWS5D8dldISdQaSqiKE5l5bHqWkj0zPSR6adJI96IDUza1T2qKzMVHk0nGZffXfDRkfYGUSqilgaj6Wok0dna4weI4+7ZWwOTs4ZK49pXB6HBoMPOsLOIFJV0PpYzrnG52rWXC5X7nhR4Xa7xVuXhVNc2smCCaJmGK2X0WDwQUfYGUSqiAhaOwlLY+BYSM7OFbncjeRT6Zx2ThNVtJLqs2df6Ag7g0h9OX2iDiqMQlPreHKUinv1GVJy9mgal/1LTj3TR/IoMS7HO52RaDLooCPsDCL15ay8vLxJk+glDxVGGeB0JpCjNKlr8tlTyLFgKgn1yznaOeeed768KjuTGkhwOqehyaCDjrAziLQz06ejEAhRTmciORopZF3gcumSZ8Bnl8ykEy68iF5mXXzJULouixpIdDqj0KQ6Zs/JR8kHdISdQaSdMSWZVrjiWWY6uZo8d+7cKfQnJF8Kn10yj06YX3AZvV5+xZV0YQ41kESrbTTZKwqvkoPO1XPyyTBL7kQHyddci8J116PgD6fTSYqSM8jVDQUFBTcWFRXdROUMUekPOUe7+ZZbXbctuF0Uc0UlNYQmewvUsuSu6CDZufAO+b5o8Z3y3T+QLDJ5lsu15C4hjUgXlf7Q1shLi+5eMH+JKIlMVix59px7KKVFPi+beO9yx+z7luOfAnSEnUGknel4u14hLS9afL926B9IFmMy3X4f0CU/KCr98ZB2ztKH57uKReERUalasna7fvSxlbLMkoHPmCwsG3CsS04TAzEtjHTJaaLSH5k46XF5TbGcXQdJ8hPLaIB+ciX+A9ARdgaRdsZ34rVi4VMGHOuSU5+WwrKf0fSJdbJ/UvFMs1heU5wjn18HSXJXozI6ws4g0s74SnaseNaAY11y8nPPS8ka8olXN6zSToPkVbJOveQXVtLt+sWXZBXfrsEJkh0v471bdMnJ43PbJGvPrrtjgjyPJNOYLJ9dB0Gy4xVMvCa+ymNyGydKNkSb5OQxdMeW7ox8C7VqNSSv1vJYpeQeQUfYGUTamV5KTn5t6oz0jPQHDX6f/HpWTvG8mW9o3ycTLFkliFQRHSS79S8ijLLG7V6DIktWCyJVBEu2JIhUESzZkiBSReiSxRcPJiQT8MySVYJIFcGSLQkiVUQoSmYCRJdMmJHcL2MyEyAsOQxgyWEASw4DWHIYwJLDAF0yGTYjmYBnlmxdWHIYwJLDAF0yYUYyj8mhAEsOA1hyGMCSw4BQlIyv4+wMIlUES7YkiFQRumQybEYyAc8sWSWIVBEs2ZIgUkWwZEuCSBWhSybMSOYxOTggUkWwZEuCSBXBki0JIlVE/0ouXOsRlOCQKC1zlK978631bUfiJBzpoCPsDCJVRL9ncvnbG1CSVJRpZjX8S67cWEW8U71J9omgcnMNSqHKlq3erVu0IiJVhCUkl6/zbNuwfduG2h3vejzveTzvk9YKkeAkucLzwYfraz/q+EkQvVD5cZ3sjXbqG0Jc8k6vN8Xr/USWEakidMlk2IxkAp57Ibn208+EztKS0hItkyl36ZiqS8tIffm6rjJZSt5Vvan+8y8am6qqmr/cXdVINU1fiXeR5y27qvdspFynw727q/ad+JmwHFu8UrJX5jIiVYQVJFMieyiVHRX789skUyJTKpeW0bH/23WjkLyvbu/XdaIgM7mpoYb8f9OaUt/8bXVza9O+uvqGA3RTr29uFZdZGEpkKXmrOECkirCEZG1YLlwrROuS5WSsG8ltmUxuD1aRQkhubiXn4jNAkluE28rN3+2mD4TlU5n8SslecYBIFaFLJkjY9yga4wdFY3LtDhp99+eXlmynIVi/XYsRmm7aPd+uhdtd1VUtHSUfbKgRmaxLJuvWpw8ymTjkdh9G0RA/HnG7f0JZwcSLNBeuLSn1kFmRu4YmXprkvT9TMvtKbkk52C75QHVjCEzLxJgsCOKYTBx1uw8dNpzLv/z6G6X+7zgyL9kEohd8MrmeJl6tlRvlxEtKpoo95BaSa0Ji4iVS+Q+vd6csI1JFdJB8TA6xAXHkT1zb55LtSNDWyfgpZMHxv6DOMH//g0vV/RSyEbR+sDWIVBH4UXPJ8WNHaVw2zJF//8OFRFB+1NwP6Ag7g0gVge0J2iF7xgvt8PYESkGkisBGI+2YlMwbjSgFkSpC3zKoDZOSecsgpSBSVeibf/UO3vxLLYhUFW3b+PUK3sZPLYhUFe0bcvYC3pBTMYhUGYq21u1p2xqmXwm5TbKZwIkJte3uGRPE0OSLVlLxCYn6E06DJCUmxNPaiZbI7Nj6xNHsyzyDeDwOCWLG0XrZHAPHcRqHDBGR06JoBhUI0VHTIvvsORfDMAzDMAzDMAzDMAzDMAzDMAzDMAwTPByO/wHpelAWpGsA2AAAAABJRU5ErkJggg==)
value
The value of `<sdpi-textfield>` is represented as a `boolean`.

```
{  
    "first_name": "Richard"  
}  

```

## Configuration
The component supports the following configuration.  
| Name  | Type  | Description  |  
| --- | --- | --- |  
| `disabled`  | `boolean`  | Determines whether the input is disabled.  |  
| `maxlength`  | `number`  | Optional maximum length of the value.  |  
| `pattern`  | `string`  | Optional regular expression used to validate the input.  |  
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
