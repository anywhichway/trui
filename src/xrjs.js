(() => {
    window.component = (source,{target,mode,tag}={}) => {
        let el;
        if(typeof source === "function") {
            el =- source();
        } else {
            el = document.createElement(tag || "div");
            const template = document.getElementById(source);
            el.innerHTML = template ? template.innerHTML : "Not Found: " + source;
        }
        if(mode) {
            const nodes = el.childNodes;
            el.attachShadow({mode});
            el.shadowRoot.append(...nodes);
            if(target) target.append(el);
        } else if(target) {
            if(tag) target.append(el);
            else target.append(...el.childNodes);
        }
        if(el.resolve) el.resolve(true);
        return el;
    }
    rjs.add =  (t, ...els) => {
        let w = "beforeend";
        if (t.constructor.name === "Object") {
            w = t.where || "beforeend";
            t = t.target;
        }
        let n = t
        for (let e of els.flatMap()) {
            n.insertAdjacentElement(w, e);
            if (w !== "afterend") w = "afterend";
            n = e;
        }
    };
})();