//van 1704, trui 1560
let _d_;
const dMap = new Map(),
    rMap = new WeakMap(),
    dp = Object.defineProperty,
    doc = document,
    observe = (f) => rctr(() => {
        const prev = _d_;
        _d_ = f;
        const v = f();
        _d_ = prev;
        return v;
    }),
    rctr = object => {
        let _v_ = object.valueOf();
        const R = Reflect,
            updt = (t) => {
                for(let d of [...dMap.get(t)||[]]) {
                    if(typeof d === "function") d();
                    else if(d.isConnected && d!==this) rMap.get(d)?.call(d);
                }
            },
            resolve = () => typeof _v_ === "function" ? _v_() : _v_,
            proxy = new Proxy(object,{
                get(t,p) {
                    if(p==="toJSON" || p==="valueOf") return () => resolve();
                    if(p==="toString") return () => resolve().toString();
                    if(p==="isReactor") return true;
                    if(p==="peek") return resolve();
                    if(_d_) dMap.set(t,(dMap.get(t) || new Set()).add(_d_));
                    const value = p==="value" ? resolve() : R.get(t,p);
                    if(value?.isReactor) return value;
                    if(value && typeof value==="object") return t[p] = rctr(value);
                    return value;
                },
                set(t,p,v) {
                    if(_v_!==v) {
                        if(p==="value") _v_ = v;
                        else R.set(t,p,v);
                        updt(t);
                    }
                    return true;
                },
                deleteProperty(t,p) {
                    let result = true;
                    if(p==="value") _v_ = undefined;
                    else result = R.deleteProperty(t,p,v);
                    updt(t);
                }
            });
        if(typeof object==="function") resolve();
        return proxy;
    },
    state = v => {
        return {
            object(v) { return v ? rctr(v) : v },
            function(v) { return rctr(v) },
            boolean(v) { return rctr(new Boolean(v)) },
            number(v) { return rctr(new Number(v)) },
            string(v) { return rctr(new String(v)) },
            bigint(v) { return rctr(new BigInt(v)) },
            undefined(v) {  }
        }[typeof v](v);
    },
    tags = new Proxy({}, {
        get(t, tag) {
            return (attrs, ...children) => {
                return (function r() {
                    if (attrs) {
                        r.attrs = attrs;
                        if (children) r.children = children;
                        if (typeof attrs === "function") attrs = attrs();
                    } else {
                        attrs = typeof r.attrs === "function" ? r.attrs() : r.attrs || {};
                        children = r.children;
                    }
                    const prv = _d_,
                        e = doc.createElement(tag),
                        t = typeof attrs;
                    if(["string","number","boolean","bigint"].some(type => type===t || type===attrs.constructor.name.toLowerCase()) || (t==="object" && (attrs instanceof Node || attrs instanceof Array))) { children = [attrs,...children]; attrs = {}; }
                    children = children.flat();
                    rMap.set(e, r);
                    _d_ = e;
                    !attrs.oncreate || attrs.oncreate(dp(new Event('create', {bubbles: true, cancelable: false}), 'target', {value: e}));
                    for (let a in attrs) {
                        if(!isNaN(parseInt(a))) continue;
                        if (a.startsWith('on')) {
                            e.addEventListener(a.substring(2).toLowerCase(), async e => {
                                const prv = _d_;
                                _d_ = e.target;
                                await attrs[a](e);
                                _d_ = prv;
                            })
                            continue;
                        }
                        const value = typeof attrs[a] === "function" ? attrs[a].call(e) : attrs[a],
                            type = typeof value;
                        if (a === 'style' && type==="object") Object.assign(e.style, value);
                        else if (a === 'dataset') Object.assign(e.dataset, value);
                        else if(a === 'value') e.value = value;
                        else e.setAttribute(a, value && type==="object" ? JSON.stringify(value) : value);
                        if(a==="href" && trui.load) dp(e, 'load', {configurable:true,value: trui.load});
                    }
                    for (let c of children) {
                        if (typeof c === 'function') c = c();
                        if (c.nodeType === Node.TEXT_NODE) e.appendChild(c);
                        else if (c && typeof c === "object" && c instanceof Node) e.appendChild(c);
                        else e.appendChild(doc.createTextNode(c + ""));
                    }
                    _d_ = prv;
                    if (this instanceof Node) {
                        rMap.delete(this);
                        this.replaceWith(e);
                    }
                    return e;
                })();
            };
        }
    });
const trui = ({load}={}) => {
    if(load) trui.load = load;
    return trui;
}
Object.assign(trui, {tags, state, observe});

export {trui, trui as default}