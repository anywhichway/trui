(() => {
    const parse = window.parse = (value) => {
            if(typeof value!== "string") return value;
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
                    if(target.state[prop]!==undefined) return target.state[prop];
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
                return new Function('c', 'with(c){return `' + str + '`}').call(globalThis,ctx(node))
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
        oldValue===value || t.resolve(true,{prop:name});
    }
    Object.defineProperty(Hp,"state", {
        configurable:true,
        get() {
            Object.defineProperty(this,"state",{value:new Proxy({}, {
                get(target, prop) {
                    if(prop==="assign") return (object) => Object.assign(target,object);
                    return target[prop];
                },
                set: (target, prop, value) => {
                    if(target[prop]===value) return true;
                    target[prop] = value;
                    !this.render || this.render();
                    this.resolve(true,{prop});
                    return true;
                }
            })});
            return this.state;
        }
    });
    Object.defineProperty(Hp,"dataset", {
        get() {
            return new Proxy(dataset.get.call(this), {
                get: (target, prop) => {
                    if(prop==="assign") return (object) => Object.assign(target,{...object});
                    return target[prop]
                },
                set: (target, prop, value) => {
                    const oldValue = target[prop];
                    target[prop] = value;
                    if(oldValue!==target[prop]) {
                        !this.render || this.render();
                        this.resolve(true,{prop})
                    }
                    return true;
                }
            });
        }
    });
    Hp.resolve = function(run,{prop,root}={}) {
        const t = this;
        if(t.tagName==="SCRIPT") {
            if(run) {
                const s = document.createElement("script");
                s.textContent = t.textContent;
                s.type = t.type;
                window.currentElement = s;
                t.replaceWith(s);
                window.currentElement = null;
            }
        } else if(t.tagName!=="CODE") {
            t.normalize();
            for (const attr of t.attributes) {
                attr._$ ||= attr.value;
                if (["$",prop].every(s => !s || attr._$.includes(s))) t.setAttribute(attr.name, resolve(attr._$, root||t));
            }
            const childNodes = t.shadowRoot ? t.shadowRoot.childNodes : t.childNodes;
            for (const child of childNodes) if (child.resolve) child.resolve(run,{prop,root:t.shadowRoot ? t : null});
        }
    }
    Text.prototype.resolve = function(_,{prop}) {
        const t = this;
        t._$ ||= t.textContent;
        if(["$",prop].every(s => !s || t._$.includes(s))) t.textContent = resolve(t._$, t);
    }
    let _currentElement;
    Object.defineProperty(window,"currentElement",{get: () => document.currentScript||_currentElement,set: (value) => _currentElement = value});
    document.addEventListener("DOMContentLoaded", () => document.body.resolve());
})()