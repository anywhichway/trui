<script src="./src/rhtml.js"></script>
<script src="./src/rhtmlx.js"></script>
<script src="./src/rjs.js"></script>
<script>var {button,input,span,p} = rjs.tags;</script>
<script src="./src/xon.js"></script>

# Tiny Reactive UI For JavaScript

If you are viewing this as a README.md, visit https://anywhichway.github.io/trui/ for a more interactive experience.

The closest comparable libraries are [VanJS](https://vanjs.org/) and [htmx](https://htmx.org/).

You can think of `trui` as what might happen if VanJS and htmx had a baby:
- It's `rjs.js` (reactive JavaScript) is API compatible with VanJS but slightly larger
- All files combined are smaller than htmx
- It has all of VanJS's core capabilities, and many of htmx's,
- Most importantly, `trui` provides `rhtml.js`, reactive HTML templating without the need for developer JavaScript

Learning and using `trui`
- You can learn and use `rjs.js`, `rhtml.js`, or the htmx like `element-fetch.js` and `xon.js` separately or together. They know about and can leverage each other, but do not require each other.


## Installation

```bash
npm install trui
```
Then use the `trui.js` or `trui.min.js` file in the root directory.


## Basic Examples

### Reactive HTML Templates (rhtml.js)



```!html
<p style="border:1px solid black;padding:5px">
<button onclick="this.state.counter||=0;this.state.counter++">Click Count: ${counter||0}</button>
</p>
```

Set age to greater than or equal 21 to see the Access Granted message.

```!html
<p id="person" style="border:1px solid black;padding:5px" data-name="Joe" data-age="21" title="Those 21 and older are eligible">
    Name: ${name} Age: ${age}
    Age: <input name="age" type="number" value=${age} oninput="person.dataset.age=event.target.value">
    <span style="display:${age >=21 ? '' : 'none'}">Access is granted</div>
</p>
```

By loading `rhtmx.js` you can get utility functions like `$data`, `$state` and `$attribute` to facilitate data updates and reactive rendering. 


```!html
<p style="border:1px solid black;padding:5px" data-name="Joe" data-age="21" title="Those 21 and older are eligible" oninput="$data(event,false)">
    Name: ${name} Age: ${age}
    <input name="age" type="number" value="${age}">
    <span style="display:${age >=21 ? '' : 'none'}">Access is granted</span>
</p>
```


### Reactive JavaScript (rjs.js) - similar to VanJS

Whereas states cannot be private with `rhtml.js`, they are a property of each element, with `rjs.js` they can be private.


<script>var {button,input,span,p} = rjs.tags;</script>
```!javascript
var rjsCounter = () => {
        const state = rjs.state(0);
        return button({
            onclick() {
                state.value++;
            }
        }, () => {
            return `Click Count: ${state.value}`
        });
    }
document.currentScript.insertAdjacentElement("afterend", rjsCounter());
```

However, you can use the public state if you wish:

```!html
<script>
var rhtmlCounter = () => {
    return button({
        onclick(event) {
            this.state.count ||= 0;
            this.state.count++;
            // state would also be available as event.target.state
        }
    }, (state) => {
        return `Click Count: ${state.count||=0}`
    });
}
document.currentScript.insertAdjacentElement("afterend", rhtmlCounter());
</script>
```

Below we return to the eligibility example using private state instead of data attributes:

```!javascript
var rjsForm = () => {
    const state = rjs.state({name:"Joe",age:21});
    return p({
        oninput(event) {
            state.value[event.target.name] = event.target.value;
        },
        style: "border:1px solid black; padding:5px"
    }, () => {
        return `Name: ${state.name} Age: ${state.age} `;
    },() => { 
        return input({
            name: "age",
            type: "number",
            value: state.value.age
        });
    }, () => {
        return span({
            style: `display:${state.age >=21 ? '' : 'none'}`
        },() => {
            return "Access is granted";
        });
    });
}
document.currentScript.insertAdjacentElement("afterend", rjsForm());
```

### Element Fetch (element-fetch.js) - similar to htmx load

```!html
<script src="./src/element-fetch.js"></script>
```

### Xon (xon.js) - similar to htmx triggers

```!html
<p target=">" x-on='every:1000'>${new Date()}</p>
```

The `target` attribute is used to specify the target of the `xon` operation. The `>` means inner. Additional options include:
- `<|` before begin
- `|>` after begin
- `>|` before end
- `|>` after end
- `<` outer, i.e. replace


## Reactive HTML Templating (`rhtml.js`)

### $attribute (`rhtmlx.js`)

`$attribute` is a utility function that can be used to update the attributes of an element. It is capable of accomplishing 3 things:
1. Binding to the element for which the attribute needs to be updated
2. Mapping the name of an input element to the attribute key, or taking an override
3. Setting an attribute value (which may cause a reactive response)

`$attribute` is polymorphic. These are the signatures:
- `$attribute(event:Event,selector:string|boolean,{property:string,value:any,stop:boolean=true})`
- `$attribute(element:HTMLElement,selector:string|boolean,{property:string,value:any,stop:boolean=true})`
- `$attribute(selector:string,{property:string,value:any,stop:boolean})`

`event` is the event that triggered the update
- By default `property` will be set to the value of the `name` attribute of the element that produced the event.
- By default `value` will be set to the `value` attribute or property of the element that produced the event.
- The `currentTarget` of the event is the element for which the attribute should be set.

`element` is the element on from which the closest matching parent should be found, unless `selector` is `false`, in 
which case it will be the element on which the attribute value will be set. Values for `property` (the attribute name)
and `value` must be provided.

`selector` is used to find the element to which the attribute should be applied.
- If `false` the target of the event is the target. 
- If `true` (only used for elements hosting a shadowDOM), the shadow host, i.e. the hosting element, is returned
- If it is a string, it is a CSS selector that is used to select the closest matching parent

See `$data` below for an example.

### $data (`rhtmlx.js`)

`$data` accomplishes the same three things as `$attribute` but for the `dataset`.

Here is the same content as used in the simple examples, but with a selector to find the `p` element with `data` attribute:

```!html
<p style="border:1px solid black;padding:5px" data-name="Joe" data-age="21" title="Those 21 and older are eligible">
    Name: ${name} Age: ${age}
    <input name="age" type="number" value=${age} oninput="$data(event,'p:has(> input)')">
    <span style="display:${age >=21 ? 'block' : 'none'}">Access is granted</span>
</p>
```

If you have a complex structure, you can create dynamic selectors with string templates, e.g. `p[data-${event.target.name}]:has(> input)`.


### $state (`rhtmlx.js`)

`$state` accomplishes the same three things as `$attribute` but for the `state`.


## Reactive JavaScript (`rjs.js`)

Can be used standalone or with any other `trui` files.

## Element Fetch (`element-fetch.js`)

Can be used standalone or with any other `trui` files.

## Xon (`xon.js`)

Can be used standalone or with any other `trui` files.



## Comparing trui wuth VanJS and htmx

- trui `rjs.js` is 1,548 bytes minified and gzipped, while VanJS official number is 1,055
- the combined size of `rjs.js` htmx like add-ons is 2,792 bytes, less than half the size of htmx
- trui core has a slightly smaller API surface than VanJS, it does not support `add` by default, but it can be added with an extension
- trui has the additional aliases `observe`, `value`, and `peek` for the VanJS `derive`, `rawValue`, and `val` respectively
- there are number of htmx capabilities that are not in trui, e.g. history management, form validity checking, animations
- when resolving state values in templates, trui does not require accessing the `value` property, VanJS does, e.g. `console.log(`Counter: ${counter}`))` vs `console.log(`Counter: ${counter.val}`))`
- if existing nodes are provided as child nodes, trui will move them into its scope, VanJS will not and throws an error
- neither VanJS or htmx provide a reactive HTML templating like `rhtml.js` and `rhtmlx.js`
- VanJS and HTMX are more mature, and have way more supporters, documentation, and add-ons
- trui has a powerful addon for dynamic content loading that works similar to htmx, targets include inner, outer (replace), before begin, after begin, before end, after end
- true provides an `oncreate` handler
- trui does not have a TypeScript definition file
- true does not currently have an SSR package

## Roadmap

Post ideas at https://github.com/anywhichway/trui/issues

- Add a `trui-ssr` package

## License

MIT

## Release History (Reverse chronological order)

v0.0.5a 2024-04-31

- added `rhtml.js` to provide reactive HTML templating
- added `rhtmlx.js` to provide utility functions for `rhtml.js`
- renamed `trui.js` to `rjs.js`
- improved documentation

v0.0.4a 2024-04-28

- added `xon` to emulate some htmx capability
- added `add` as a separate module to emulate VanJS
- minor code clean-up, added one GC step

v0.0.3a 2024-04-27

- version source sync with NPM

v0.0.2a 2024-04-27

- removed some un-needed tracking of elements that do not reference state

v0.0.1a 2024-04-27 Initial release

- I do not expect trui will get any larger, and if it does it will only be by a few bytes
- The architecture for adding functionality without increasing core size more than a few bytes is in place, see the use of `load` in the examples

<script type="module">
    import {examplify} from 'https://unpkg.com/examplify?module';
    const onload = () => setInterval(() => {
        if (document.readyState === "complete") {
            clearInterval(interval);
            examplify(document);
            xon.activateDOM();
            document.body.resolve();
        }
    });
    const interval = onload();
</script>



