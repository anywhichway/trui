# trui
Tiny Reactive UI

Trui is a tiny reactive UI library for JavaScript.

The closest comparable library is VanJS.

## Comparing trui and VanJS

- trui is 1,560 bytes minified and gzipped, while VanJS official number is 1,055
- trui has a slightly smaller API surface than VanJS, it does not support `add`
- trui uses the function 'observe' instead of 'derive'
- trui uses `peek` instead of `rawValue` and `value` instead of `val`
- trui state objects are a little more powerful than VanJS, they will automatically yield reactive nested states
- when resolving state values in templates, trui does not require accessing the `value` property, VanJS does, e.g. `console.log(`Counter: ${counter}`))` vs `console.log(`Counter: ${counter.val}`))`
- if existing nodes are provided as child nodes, trui will move them into its scope, VanJS will not and throws an error
- VanJS is more mature, has way more supporters, documentation, and add-ons
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
<script type="module">
import {trui} from './trui.js';
import {load} from './load.js';
trui({load});

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

<div href="./examples/footer.html" target=">" onclick="this.load()">Footer Placeholder</div>

<script>
    load.patchDOM()
</script>
</body>
```

## Roadmap

Post ideas at https://github.com/anywhichway/trui/issues

- Add a `trui-ssr` package
- Add the ability to interpolate HTML directly, e.g. `div`<span>Counter: ${counter}</span>`</div>` actually in an HTML file not in JavaScript

## License

MIT

## Release History (Reverse chronological order)

v0.0.3a 2024-04-27

- version source sync with NPM

v0.0.2a 2024-04-27

- removed some un-needed tracking of elements that do not reference state

v0.0.1a 2024-04-27 Initial release

- I do not expect trui will get any larger, and if it does it will only be by a few bytes
- The architecture for adding functionality without increasing core size more than a few bytes is in place, see the use of `load` in the examples



