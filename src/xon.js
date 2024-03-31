(() => {
    const functions = {
        async html(ev, fn) {
            const parts = fn.split(".");
            let f = globalThis;
            for (let p of parts) {
                f = f[p];
                if (!p) {
                    console.warn(`xon: ${fn} is not a valid function`);
                    return false;
                }
            }
            if (typeof f === "function") return f(ev);
            else console.warn(`xon: ${fn} is not a valid function`);
        },
        async call(ev, fn) {
            return !!functions.html(ev, fn);
        },
        async delay(ev, ms) {
            return new Promise(resolve => setTimeout(() => resolve(true), ms));
        },
        ephemeral(ev, ms) {
            const html = ev.target.innerHTML;
            setTimeout(() => {
                ev.target.innerHTML = html
            }, ms);
            return true;
        },
        every(ev, ms) {
            return functions.throttle(ev, ms)
        },
        async fetch(ev, options) {
            await this.fetch(options);
            return true;
        },
        preventDefault(ev) {
            ev.preventDefault();
            return true;
        },
        stop(ev) {
            ev.stopPropagation();
            return true;
        },
        stopImmediate(ev) {
            ev.stopImmediatePropagation();
            return true;
        },
        throttle(ev, ms) {
            let last = 0;
            return () => {
                if (Date.now() - last > ms) {
                    last = Date.now();
                    return true;
                }
                return false;
            }
        }
    }

    const xon = (e, a, ctx) => {
        const keywords = ["once", "capture", "passive", "preventDefault", "stop", "stopImmediate"],
            parts = a.split(" "),
            enames = parts.filter(p => !p.includes(":") && !keywords.includes(p)),
            opts = parts.filter(p => keywords.includes(p) || ["once", "capture", "passive"].includes(p)).reduce((opts, key) => {
                opts[key] = true;
                return opts;
            }, {}),
            mods = parts.filter(p => p.includes(":") || ["preventDefault", "stop", "stopImmediate"].includes(p)).reduce((mods, mod) => {
                    let [f, arg] = mod.split(":");
                    if (functions[f]) {
                        try {
                            arg = JSON.parse(arg);
                        } catch (e) {
                            arg = arg || null;
                        }
                        mods[f] = function (ev) {
                            return functions[f].call(this, ev, arg);
                        }
                        mods[f].arg = arg;
                    } else {
                        console.warn(`xon: ${f} is not a valid function`);
                    }
                    return mods;
                },
                {});
        if (mods.every) {
            e.everyInterval = setInterval(async () => {
                if (!e.isConnected) {
                    clearInterval(e.interval);
                    return;
                }
                let result = true;
                for (let m in mods) {
                    const prv = ctx._d_;
                    ctx._d_ = e;
                    result = await mods[m].call(e);
                    if (typeof result === "function") result = await result.call(e);
                    ctx._d_ = prv;
                    if (result === false) break;
                }
                if (result === false) clearInterval(e.interval);
                else if (result != null && typeof result !== "boolean") {
                    e.innerHTML = typeof result === "object" ? JSON.stringify(result) : result;
                } else if (e.resolve) e.resolve();
            }, mods.every.arg);
        }
        for (let n of enames) {
            e.addEventListener(n, async ev => {
                let result = true;
                for (let m in mods) {
                    const prv = ctx._d_;
                    ctx._d_ = e;
                    result = await mods[m].call(e, ev);
                    if (typeof result === "function") result = await result.call(e, ev);
                    ctx._d_ = prv;
                    if (result === false) break;
                }
                if (result != null && typeof result !== "boolean") {
                    e.innerHTML = typeof result === "object" ? JSON.stringify(result) : result;
                }
            }, opts)
        }
    }
    HTMLElement.prototype.xon = xon;

    const onload = () => setInterval(() => {
        if (document.readyState === "complete") {
            clearInterval(interval);
            [...document.querySelectorAll('[xon]'),...document.querySelectorAll('[x-on]')].forEach(el => {
                xon(el, el.getAttribute('xon')||el.getAttribute('x-on'), typeof trui === "function" ? trui.ctx : {})
            });
        }
    });
    const interval = onload();
})();
