<script src="./src/rhtml.js"></script>
<script src="src/xrhtml.js"></script>
<script src="src/xfetch.js"></script>
<script src="./src/rjs.js"></script>
<script src="./src/xrjs.js"></script>
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

### Reactive HTML Templates (rhtml.js 1316 bytes)



```!html
<p style="border:1px solid black;padding:5px">
<button onclick="this.state.counter||=0;this.state.counter++">Click Count: ${counter||0}</button>
</p>
```

Set age to greater than or equal 21 to see the Access Granted message.

```!html
<p id="person" style="border:1px solid black;padding:5px" data-name="Joe" data-age="21" title="21 and older are eligible">
    Name: ${name} Age: ${age}
    Age: <input name="age" type="number" value=${age} oninput="person.dataset.age=event.target.value">
    <span style="display:${age >=21 ? '' : 'none'}">Access is granted</div>
</p>
```

By loading `rhtmx.js` (804 bytes) you can get utility functions like `$data`, `$state` and `$attribute` to facilitate data updates and reactive rendering. 


```!html
<p style="border:1px solid black;padding:5px" data-name="Joe" data-age="21" title="21 and older are eligible" oninput="$data(event,false)">
    Name: ${name} Age: ${age}
    <input name="age" type="number" value="${age}">
    <span style="display:${age >=21 ? '' : 'none'}">Access is granted</span>
</p>
```


### Reactive JavaScript (rjs.js 1600 bytes) - similar to VanJS

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
            state[event.target.name] = event.target.value;
        },
        style: "border:1px solid black; padding:5px"
    }, () => {
        return `Name: ${state.name} Age: ${state.age}`;
    },() => { 
        return input({
            name: "age",
            type: "number",
            value: state.age
        });
    }, () => {
        return span({
            style: `display:${state.age >=21 ? '' : 'none'}`
        },() => {
            return " Access is granted";
        });
    });
}
document.currentScript.insertAdjacentElement("afterend", rjsForm());
```

### Element Fetch (xfetch.js 1148 bytes) - similar to htmx load

```!html
<script src="./src/element-fetch.js"></script>
```

### Xon (xon.js 1304 bytes) - similar to htmx triggers

```!html
<p style="border:1px solid black;padding:5px" target=">" x-on='every:1000' >${new Date()}</p>
```

The `target` attribute is used to specify the target of the `xon` operation. The `>` means inner. Additional options include:
- `<|` before begin
- `|>` after begin
- `>|` before end
- `|>` after end
- `<` outer, i.e. replace


## Reactive HTML (`rhtml.js`)

With reactive html, you can use the JavaScript `${}` syntax directly in your HTML.

- Attributes and `dataset` values are automatically reactive if they are referenced within `${}`.
- A `state` property is added to all `HTMLElement` objects. Unlike the `dataset` property, `state` can contain values of any type including nested objects and functions.

Note: `rhtml.js` should be loaded in the `head` of your HTML document.


### Reactive Attributes, Datasets, and States

```!html
<p style="border:1px solid black;padding:5px">
    <button name="Greetings!!"
            onclick="this.getAttribute('name')=='Greetings!!' ? this.setAttribute('name','Goodbye...') : this.setAttribute('name','Greetings!!')">
        ${name}
    </button> Attribute Update<br>
    <button data-counter="0" onclick="this.dataset.counter++">Click Count: ${counter}</button>  Dataset Update<br>
    <button onclick="this.state.counter||=0;this.state.counter++">Click Count: ${counter||0}</button> State Update<br>
    <button style="color:blue" onclick="this.style.color==='blue' ? this.style.color='red' : this.style.color='blue'">Click To Color</button> Style Update<br>
    <button data-counter="0" style="color:${counter%2 ? 'red' : 'blue'}" onclick="this.dataset.counter++">Click Count: ${counter}</button> Dataset Update With Computed Style
</p>
```

- Attribute and dataset values are scoped to the element on which they are set. 
- States are scoped to an element and its children, i.e. children will inherit the `state` of their parent. And, state
properties can be shadowed in child elements.
- Nested objects in states are automatically reactive.

### Resolving Reactive HTML

The best way to resolve reactive HTML is to call `document.resolve()` in a script immediately after the `body` tag of a document:

`document.resolve()` will hide the body, resolve the document, and then un-hide the body. If you do not want the body
to be hidden, you can call `document.resolve({hidden:false})`; however, this will result in screen flicker.

`document.resolve()` can be called with a `state` and `dataset` argument for use in resolving reactive values in the document.
Updating properties of `document.body.state` or `document.body.dataset` will then trigger a re-render of the document.

```html
<body>
    <script>
        document.resolve({state:{greeting:"Hello World!",counter:0}});
        document.currentScript.remove();
    </script>
${greeting}
</body>
```

<b>IMPORTANT<b>: You MUST make the call to remove the current script, or the resolve in this script will override any 
state or dataset values set elsewhere in the document.


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
<p style="border:1px solid black;padding:5px" data-name="Joe" data-age="21" title="21 and older are eligible">
    Name: ${name} Age: ${age}
    <input name="age" type="number" value=${age} oninput="$data(event,'p:has(> input)')">
    <span style="display:${age >=21 ? '' : 'none'}">Access is granted</span>
</p>
```

If you have a complex structure, you can create dynamic selectors with string templates, e.g. `p[data-${event.target.name}]:has(> input)`.

### $state (`rhtmlx.js`)

`$state` accomplishes the same three things as `$attribute` but for the `state`.


## Reactive JavaScript (`rjs.js`)

Can be used standalone or with any other `trui` files.

The functionality of `rjs.js` is similar to VanJS.


## Extended Fetch (`xfetch.js`)

Can be used standalone or with any other `trui` files.

When `xfetch.js` is loaded:

- all elements will have a `fetch` method that can be used to load content into or replace the element.
- all element can use an `href` and `target` attribute, or alternatively `x-href` and `x-target` for compliance with the HTML standard.
- under certain conditions, you can dispense with SSR by making a relatively minor change to you HTML authoring approach.

Clicking on `Privacy Policy` below will load the content of the `privacy-policy.html` file into the `p` element. 

```!html
<p x-href="./examples/privacy-policy.html#content" onclick="xfetch(event)">Privacy Policy</p>
```

### Dispensing with SSR

If you are not trying to build a single page application, you can dispense with SSR by making a relatively minor change to your HTML authoring approach.

Since `href` is not standard on all elements and `x-href` is not standard at all, web crawlers and indexing services may not
find all your content if you author like this:

```html
<p x-href="./examples/privacy-policy.html#content" onclick="xfetch(event)">Privacy Policy</p>
```

However, by adding an anchor with the class `xfetch` you can make the privacy policy visible to all web 
crawlers and indexing services even without the user clicking on the link, and will also make the content available to 
users with JavaScript disabled and ensure proper behavior of the browser back button:

```!html
<p title="Privacy Policy" onclick="xfetch(event)" x-target=">">
    <a class="xfetch" href="./examples/privacy-policy.html#content" target="_top">Privacy Policy</a>
</p>
```

Note the targets above. A `target` or `x-target` on the `p` element will be used as the target for the `fetch` operation.
Whereas the `target` on the `a` element will be used when JavaScript is not enabled. If you do not provide a target
on the container element, it will fall through to the target on the `a` element. If neither is provided, the default
target is for the container is `>`, i.e. inner content.

Using a hash in the `href` allows the loaded content to be an entire webpage with header, footer, and other content,
but only the content with the `id` specified in the hash will be loaded into the target element. But, when JavaScript is
disabled, the entire page will be loaded and simply scrolled to the target.

## Xon (`xon.js`)

Can be used standalone or with any other `trui` files.

## Comparing trui To Other Libraries

THe most relevant libraries to compare `trui` to are `VanJS` and `htmx`. Neither `VanJS` nor `htmx` provide reactive 
HTML templating like `rhtml.js` and `rhtmlx.js`. You could use either one of these libraries in conjunction with
just `rhtml.js` and `rhtmlx.js`.

### rjs.js and xrjs.js vs VanJS

- `rjs.js` is 1,548 bytes minified and gzipped, while `VanJS` official number is 1,055
- `rjs` has a slightly smaller API surface than `VanJS`, it does not support `add` by default, but it can be added by loading `xrjs.js`
- `xrjs` supports a higher level component model than `VanJS`
- `rjs` has the additional aliases `observe`, `value`, and `peek` for the `VanJS` `derive`, `rawValue`, and `val` respectively
- when resolving state values in templates, `rjs` does not require accessing the `value` property, VanJS does, e.g. `console.log(`Counter: ${counter}`))` vs `console.log(`Counter: ${counter.val}`))`
- if existing nodes are provided as child nodes, rjs will move them into its scope, VanJS will not and throws an error
- `rjs` is `rhtml` aware and will resolve reactive values in generated HTML
- `rjs` provides an `oncreate` handler
- `rjs` does not have a TypeScript definition file
- `rjs` does not currently have an SSR package, although with `rhtml.js`, `rhtmlx.js`, and `xfetch.js` you may not need SSR
- `VanJS` is more mature, and has way more supporters, documentation, and add-ons

### xon.js and xfetch.js vs htmx

- the combined size of `xon.js` and `xfetch.js` combined are less than half the size of `htmx`
- there are number of `htmx` capabilities that are not in trui, e.g. form validity checking, animations
- `htmx` is more mature, and has way more supporters, documentation, and add-ons

## Roadmap

Post ideas at https://github.com/anywhichway/trui/issues

- Add a `rjs-ssr.js` package
- Add an `xform.js` package to support form validation

## License

MIT

## Release History (Reverse chronological order)

v0.0.18a 2024-04-12

Fix for undefined function `dp` (Object.defineProperty) in `xhtml.js`

v0.0.17a 2024-04-11 

Added `document.resolve()` to hide body, resolve document, and unhide body instead of just automatically resolving body.

v0.0.16a 2024-04-11

more handling of nested ${ with HTML as its result value

v0.0.15a 2024-04-11

more handling of nested ${ with HTML as its result value

v0.0.14a 2024-04-11

more handling of nested ${ with HTML as its result value

v0.0.13a 2024-04-11

more handling of nested ${ with HTML as its result value

v0.0.12a 2024-04-11

more handling of nested ${ with HTML as its result value

v0.0.11a 2024-04-11

more handling of nested ${ with HTML as its result value

v0.0.10a 2024-04-11

Addressed issue with properly handling nested ${ with HTML as its result value

v0.0.8a 2024-04-01

- renamed `element-fetch.js` to `xfetch.js`
- renamed `rhtmlx.js` to `xrhtml.js`
- split `xrhtml.js` into `rhtmlx.js` and `xrjs.js`
- improved non-SSR approach
- improved documentation

v0.0.7a 2024-04-01

- added element-fetch.js to README, documented approach to dispensing with SSR

v0.0.6a 2024-04-31

- improved documentation

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



