# trui
Tiny Reactive UI

Trui is a Tiny Reactive UI library for JavaScript.

The closest comparable libraries are [VanJS](https://vanjs.org/) and [htmx](https://htmx.org/).

You can think of `trui` as what might happen if VanJS and htmx had a baby:
- It is slight larger than VanJS, but a lot smaller than htmx
- It has all of VanJS's core capabilities, some of its extended capabilities, many of htmx's, and a couple of extra goodies
- You can learn and use just the core for VanJS capabilities, or add the extras for htmx capabilities
- You can also use some of the htmx capabilities standalone

## Comparing trui and VanJS

- trui core is 1,548 bytes minified and gzipped, while VanJS official number is 1,055
- the combined size of trui core and htmx like add-ons is 2,792 bytes, less than half the size of htmx
- trui core has a slightly smaller API surface than VanJS, it does not support `add` by default, but it can be added with an extension
- trui has the additional aliases `observe`, `value`, and `peek` for the VanJS `derive`, `rawValue`, and `val` respectively
- there are number of htmx capabilities that are not in trui, e.g. history management, form validity checking, animations
- when resolving state values in templates, trui does not require accessing the `value` property, VanJS does, e.g. `console.log(`Counter: ${counter}`))` vs `console.log(`Counter: ${counter.val}`))`
- if existing nodes are provided as child nodes, trui will move them into its scope, VanJS will not and throws an error
- VanJS and HTMX are more mature, and have way more supporters, documentation, and add-ons
- trui has a powerful addon for dynamic content loading that works similar to htmx, targets include inner, outer (replace), before begin, after begin, before end, after end
- true provides an `oncreate` handler
- trui does not have a TypeScript definition file
- true does not currently have an SSR package

## Installation

```bash
npm install trui
```
Then use the `trui.js` or `trui.min.js` file in the root directory.


### Examples ... a bit of a kitchen sink for now

Most of the examples are drawn from VanJS.

<script src="./src/rhtml.js"></script>
```!html
<div id="person" data-name="Joe" data-age="21" href="/profile" title="Those 21 and older are eligible">
    Name: ${name} Age: ${age} Profile: ${href} Eligible: ${age >= 21 ? "Yes" : "No"}
    Age: <input name="age" type="number" value=${age} oninput="$update(event,'#person')">
    <div style="display:${age >=21 ? 'block' : 'none'}">Access is granted</div>
</div>
```


## Roadmap

Post ideas at https://github.com/anywhichway/trui/issues

- Add a `trui-ssr` package

## License

MIT

## Release History (Reverse chronological order)

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
        }
    });
    const interval = onload();
</script>



