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

```html
<body>
<script type="module">
    import {trui} from '../src/trui.js';
    import {load} from '../src/load.js';
    import {add} from '../src/add.js';
    import {xon} from '../src/xon.js';
    trui({load,add,xon});

    const {button,input,div, sup} = trui.tags;

    const myButton = () => {
        const state = trui.state(false);
        return button(() => {
            return {
                onclick() {
                    state.value = !state.value
                },
                style() {
                    return {
                        background: state.value ? 'red' : 'blue'
                    }
                }
            }
        }, () => {
            return state.value ? 'ON' : 'OFF'
        });
    }
    document.body.appendChild(myButton());

    const myCounter = () => {
        const state = trui.state(0);
        return button({
            onclick() {
                state.value++;
            }
        }, () => {
            return state.value
        });
    }
    document.body.appendChild(myCounter());

    const myInput = () => {
        const state = trui.state(0);
        return input({
            onclick() {
                state.value++;
            },
            value: state
        });
    }
    document.body.appendChild(myInput());

    const {table, tbody, thead, td, th, tr} = trui.tags

    const Table = ({head, data}) => table(
            head ? thead(tr(head.map(h => th(h)))) : [],
            tbody(data.map(row => tr(
                    row.map(col => td(col)),
            ))),
    )

    document.body.appendChild( Table({
        head: ["ID", "Name", "Country"],
        data: [
            [1, "John Doe", "US"],
            [2, "Jane Smith", "CA"],
            [3, "Bob Johnson", "AU"],
        ],
    }))

    const ctr = trui.state(0),
            observed = trui.observe(() => {
                console.log("Counter is now", ctr.valueOf());
            });
    ctr.value++;

    // Create a new state object with init value 1
    const counter = trui.state(1)

    // Log whenever the value of the state is updated
    trui.observe(() => console.log(`Counter: ${counter}`))

    // Derived state
    const counterSquared = trui.observe(() => counter.value * counter.value)

    // Used as a child node
    const dom1 = div(counter)

    // Used as a property
    const dom2 = input(() => { return {type: "number", value: counter, disabled: true} })

    // Used in a state-derived property
    const dom3 = div({style() { return `font-size: ${counter}em;`}}, "Text")

    // Used in a state-derived child
    const dom4 = div(counter, sup(2), () => ` = ${counterSquared}`)

    // Button to increment the value of the state
    const incrementBtn = button({onclick() { ++counter.value}}, "Increment")
    const resetBtn = button({onclick() { counter.value = 1}}, "Reset")

    document.body.append(incrementBtn, resetBtn, dom1, dom2, dom3, dom4)

    const {option, select, span} = trui.tags

    const FontPreview = () => {
        const size = trui.state(16), color = trui.state("black")
        return span(
                "Size: ",
                input({type: "range", min: 10, max: 36, value: size,
                    oninput: e => size.value = e.target.value}),
                " Color: ",
                select({oninput: e => color.value = e.target.value, value: color},
                        ["black", "blue", "green", "red", "brown"]
                                .map(c => option({value: c}, c)),
                ),
                // The <span> element below has a state-derived property `style`
                span({style: () => `font-size: ${size.value}px; color: ${color.value};`}, " Hello 🍦trui"),
        )
    }

    document.body.append(FontPreview())

</script>

<p x-href="/examples/header.html" target=">" onclick="this.load()">Header Placeholder (Click Me)</p>

<p x-href="/examples/messages.html#peekaboo" target=">" x-on='mouseover ephemeral:1000 throttle:2000 load:{"options":{"method":"GET"}}'>Message (Mouseover Me)</p>

<p target=">" x-on='every:2000 html:Date.now'>Timer</p>

<script type="module">
    import {trui} from '../src/trui.js';
    import {load} from '../src/load.js';
    import {xon} from '../src/xon.js';
    load.patchDOM();
    xon.patchDOM(document.body,trui.ctx);
</script>
</body>
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



