(() => {
    const parse = (value) => {
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        },
        ctx = (node) => {
            const el = node.ownerElement || node.parentNode;
            if(!el) return new Proxy({}, {get: () => undefined,has: () => true});
            return new Proxy(el, {
                get: (target, prop) => {
                    if(typeof prop === "symbol") return Reflect.get(el, prop);
                    if(target.dataset && target.dataset[prop]!==undefined) return parse(target.dataset[prop]);
                    if(target.hasAttribute && target.hasAttribute(prop)) {
                        const value = target.getAttribute(prop);
                        return value==="" || value==="true" ? true : parse(value);
                    }
                    return target.parentElement ? ctx(target.parentElement)[prop] : window[prop];
                },
                has: () => true
            });
        },
        resolve = (str, node) => {
            try {
                return str.includes("${") ? new Function('c', 'with(c){return `' + str + '`}').call(globalThis,ctx(node)) : str
            } catch {
                return str;
            }
        },
        Hp = HTMLElement.prototype,
        sa = Hp.setAttribute,
        dataset = Object.getOwnPropertyDescriptor(Hp,"dataset");

    Hp.setAttribute = function(name,value) {
        const t = this,
            oldValue = t.getAttribute(name);
        sa.call(t,name,value);
        oldValue===value || t.resolve(true);
    }
    Object.defineProperty(Hp,"dataset", {
        get() {
            return new Proxy(dataset.get.call(this), {
                set: (target, prop, value) => {
                    const oldValue = target[prop];
                    target[prop] = value;
                    oldValue===target[prop] || this.resolve(true);
                    return true;
                }
            });
        }
    });
    Hp.resolve = function(run,root) {
        const t = this;
        if(t.tagName==="SCRIPT") {
            if(run) {
                const s = document.createElement("script");
                s.textContent = t.textContent;
                s.type = s._type || s.type;
                window.currentElement = s;
                t.replaceWith(s);
                window.currentElement = null;
            }
        } else if(t.tagName!=="CODE") {
            t.normalize();
            for (const attr of t.attributes) if ((attr._$ ||= attr.value).includes("${")) t.setAttribute(attr.name, resolve(attr._$, root||t));
            const childNodes = t.shadowRoot ? t.shadowRoot.childNodes : t.childNodes;
            for (const child of childNodes) if (child.resolve) child.resolve(run,t.shadowRoot ? t : null);
        }
    }
    Text.prototype.resolve = function() {
        const t = this;
        if((t._$ ||= t.textContent).includes("${")) t.textContent = resolve(t._$, t);
    }
    let _currentElement;
    Object.defineProperty(window,"currentElement",{get: () => document.currentScript||_currentElement,set: (value) => _currentElement = value});
    window.$closest = (scope,selector) => {
        if(scope) {
            if(typeof scope==="object") {
                window.currentElement = scope;
                scope = null;
            } else {
                selector = scope;
                scope = null;
            }
        }
        if(!selector) { // get root element if no selector
            let node = window.currentElement;
            while(node && node.parentElement) node = node.parentElement;
            return node;
        }
        return (scope||window.currentElement).closest(selector)
    }
    window.$update = (event,selector,property=event.target.getAttribute("name")) => {
        const dataset = $closest(event.target,selector).dataset,
            input = event.target;
        dataset[property] = input.hasAttribute("multiple") ? JSON.stringify([...input.selectedOptions].map(option => parse(option.value))) : input.value;
    }
    document.addEventListener("DOMContentLoaded", () => document.body.resolve());
})()