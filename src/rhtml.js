(() => {
    const parse = window.parse = (value) => {
            if(typeof value!== "string") return value;
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        },
        ctx = (node,recursing=0) => {
            return new Proxy(node.ownerElement || node || {}, {
                get: (target, prop) => {
                    if(typeof prop === "symbol") return Reflect.get(target, prop);
                    if(recursing<=1 && target[prop]!==undefined) return target[prop];
                    if(target.state && target.state[prop]!==undefined) return typeof target.state[prop] === "function" ? target.state[prop].bind(target) : target.state[prop]
                    if(recursing<=1 && target.dataset && target.dataset[prop]!==undefined) return parse(target.dataset[prop]);
                    if(recursing<=1 && target.hasAttribute && target.hasAttribute(prop)) {
                        const value = target.getAttribute(prop);
                        return value==="" || value==="true" ? true : parse(value);
                    }
                    if(target.parentElement) {
                        const value = ctx(target.parentElement,recursing+1)[prop];
                        if(value!=null) return value;
                    }
                    return window[prop];
                },
                has: () => true
            });
        },
        resolve = (str, node) => {
            try {
                return new Function('c', 'with(c){return `' + str + '`}').call(globalThis,ctx(node))
            } catch(e) {
                //console.error(e);
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
                    if(prop==="assign") return (object) => {
                        //return Object.assign(target,object);
                        return Object.entries(Object.getOwnPropertyDescriptors(object)).forEach(([key,desc]) => Object.defineProperty(target,key,desc))
                    }
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
            if (t._$) {
                t.innerHTML = resolve(t._$, root || t);
            } else {
                //t.normalize();
                for (const attr of t.attributes) {
                    attr._$ ||= attr.value;
                    if (["$", prop].every(s => !s || attr._$.includes(s))) t.setAttribute(attr.name, resolve(attr._$, root || t));
                }
                const childNodes = t.shadowRoot ? t.shadowRoot.childNodes : t.childNodes;
                for (const child of childNodes) {
                    if (child.resolve) {
                        child.resolve(run, {prop, root: t.shadowRoot ? t : null});
                    }
                }
            }
        }
    }
    Text.prototype.resolve = function(_,{prop}) {
        const t = this;
        t._$ ||= t.textContent;
        if(["$",prop].every(s => !s || t._$.includes(s))) {
            //if(t.render && !recursing) {
              //  t.render();
             //   return;
            //}
            let open = t._$.split("{").length - 1,
                close = t._$.split("}").length - 1;
            if(open===close) {
                t.textContent = resolve(t._$, t);
                return;
            }
            let node = t,
                text = t._$;
            while(close<open) {
                if(!node.nextSibling) break;
                node = node.nextSibling;
                if(node instanceof Text) {
                    let subtext = node.textContent;
                    while(close!==open) {
                        const start = subtext.indexOf("{"),
                            end = subtext.indexOf("}");
                        if(start>=0 && start<end) {
                            open++;
                            subtext = subtext.slice(end+1);
                        } else if(end>=0) {
                            close++;
                            subtext = subtext.slice(0,end+1);
                        } else {
                            break;
                        }
                    }
                    node.textContent = node.textContent.slice(subtext.length);
                    text += subtext;
                } else {
                    text += node.outerHTML;
                    node.innerHTML = "";
                }
            }
            while(node && t.nextSibling && t.nextSibling!==node && t.nextSibling.textContent.trim()==="") {
                t.nextSibling.remove();
            }
            if(node && node!==t && node.textContent.trim()==="") node.remove();
            const html = resolve(text, t),
                el = document.createElement("div");
            el.innerHTML = html.trim();
            if(el.firstChild) {
                el.firstChild._$ = text;
                t.replaceWith(el.firstChild)
            } else {
                t._$ = text;
                t.textContent = "";
                //t.render = () => t.resolve(true,{prop},true);
            }
        }
    }
    let _currentElement;
    Object.defineProperty(window,"currentElement",{get: () => document.currentScript||_currentElement,set: (value) => _currentElement = value});
    const _dispatchEvent = EventTarget.prototype.dispatchEvent;
    EventTarget.prototype.dispatchEvent = function(event) {
        if(event.type==="load" && this.loaded) return;
        this.loaded= true;
        return _dispatchEvent.call(this, event);
    }
    document.addEventListener("DOMContentLoaded", () => {
        document.body.resolve()
    });
})()