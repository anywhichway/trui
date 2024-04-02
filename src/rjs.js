(() => {
    let _d_;
    const dM = new WeakMap(), // maps elements or observer functions to their dependencies
        dp = Object.defineProperty,
        ctx = dp({}, '_d_', {get: () => _d_, set: v => _d_ = v}),
        doc = document,
        observe = f => rctr(() => {
            const prev = _d_;
            _d_ = f;
            const v = f();
            _d_ = prev;
            return v;
        }),
        parse = (value) => {
            if(typeof value!== "string") return value;
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        },
        rctr = o => {
            let _v_ = o.valueOf();
            const R = Reflect,
                updt = t => {
                    const set = dM.get(t);
                    if (!set) return;
                    for (let d of [...set]) {
                        if (typeof d === "function") d();
                        else if (!d.isConnected) set.delete(d); // gc
                        else if (d !== this) d.render();
                    }
                    set.size !== 0 || dM.delete(t);
                },
                rslv = () => typeof _v_ === "function" ? _v_() : _v_,
                proxy = new Proxy(o, {
                    get(t, p) {
                        if (p === "toJSON" || p === "valueOf") return () => rslv();
                        if (p === "toString") return () => rslv().toString();
                        if (p === "isReactor") return true;
                        if (p === "peek" || p == "rawVal") return rslv();
                        if (_d_) dM.set(t, (dM.get(t) || new Set()).add(_d_));
                        const v = p === "value" || p == "val" ? rslv() : R.get(t, p);
                        if (v?.isReactor) return v;
                        return (v && typeof value === "object") ? t[p] = rctr(v) : v;
                    },
                    set(t, p, v) {
                        v = parse(v);
                        if (_v_ !== v) {
                            p === "value" ? _v_ = v : R.set(t, p, v);
                            updt(t);
                        }
                        return true;
                    },
                    deleteProperty(t, p) {
                        p === "value" ? _v_ = undefined : R.deleteProperty(t, p, v);
                        updt(t);
                        return true;
                    }
                });
            typeof o !== "function" || rslv();
            return proxy;
        },
        state = v => {
            return {
                object: v => v ? rctr(v) : v,
                function: v => rctr(v),
                boolean: v => rctr(new Boolean(v)),
                number: v => rctr(new Number(v)),
                string: v => rctr(new String(v)),
                bigint: v => rctr(new BigInt(v)),
                undefined(v) {
                }
            }[typeof v](v);
        },
        tags = new Proxy({}, {
            get(t, tag) {
                return (attrs, ...children) => {
                    return (function r() {
                        if (attrs) { // save attrs and children from original call
                            r.attrs = attrs;
                            if (children) r.children = children;
                            if (typeof attrs === "function") attrs = attrs();
                        } else { // if no attrs, use saved attrs and children
                            attrs = typeof r.attrs === "function" ? r.attrs() : r.attrs || {};
                            children = r.children;
                        }
                        const prv = _d_,
                            e = doc.createElement(tag);
                        // if attrs is not a base Object type, add it to children and reset attrs, since it was not a style object
                        if (typeof attrs !== "object" || (attrs && attrs.constructor.name !== "Object")) {
                            children = [attrs, ...children];
                            attrs = {};
                        }
                        children = children.flat();
                        e.render = r;
                        if(this instanceof HTMLElement) {
                            e.state.assign(this.state);
                            e.dataset.assign(this.dataset);
                        }
                        _d_ = e;
                        for (let a in attrs) {
                            if (!isNaN(parseInt(a))) continue;
                            if (a.startsWith('on')) {
                                e.addEventListener(a.slice(2), async ev => {
                                    const prv = _d_;
                                    _d_ = ev;
                                    await attrs[a].call(e,ev);
                                    _d_ = prv;
                                });
                                continue;
                            }
                            if (e.xon && a.startsWith('x-on')) {
                                e.xon(e, a, ctx);
                                continue;
                            }
                            const v = typeof attrs[a] === "function" ? attrs[a].call(e) : attrs[a],
                                t = typeof v;
                            if (["style", "dataset"].includes(a) && t === "object") Object.assign(e[a], v)
                            else if (a === 'value') e.value = v
                            else e.setAttribute(a, v && t === "object" ? JSON.stringify(v) : v);
                        }
                        for (let c of children) {
                            if (typeof c === 'function') c = c(e.state);
                            if (c.nodeType === Node.TEXT_NODE) e.appendChild(c)
                            else if (c && typeof c === "object" && c instanceof Node) e.appendChild(c)
                            else e.appendChild(doc.createTextNode(c + ""));
                        }
                        _d_ = prv;
                        if (this instanceof Node) this.replaceWith(e);
                        if (e.resolve) e.resolve();
                        !attrs.oncreate || attrs.oncreate(dp(new Event('create', {
                            bubbles: true,
                            cancelable: false
                        }), 'target', {value: e}));
                        return e;
                    })();
                };
            }
        });
    const rjs = (options = {}) => Object.assign(trui, options),
        derive = observe;
    window.rjs = Object.assign(rjs, {tags, state, observe, derive, ctx});
})();