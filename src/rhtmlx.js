(() => {
    window.component = (id,{target,mode,tag}={}) => {
        const template = document.getElementById(id),
            el = document.createElement(tag||"div");
        el.innerHTML = template.innerHTML;
        if(mode) {
            const nodes = el.childNodes;
            el.attachShadow({mode});
            el.shadowRoot.append(...nodes);
            if(target) {
                target.append(el);
                el.resolve(true);
            }
        } else if(target) {
            if(tag) target.append(el);
            else target.append(...el.childNodes);
        }
        return el;
    }
    window.$closest = (scope,selector) => {
        if(scope) {
            if(typeof scope==="object") {
                window.currentElement = scope;
            } else {
                selector = scope;
            }
        }
        if(selector===false) return scope;
        scope = window.currentElement;
        if(selector==null || selector===true) { // get root element if no selector
            let node = window.currentElement;
            while(node && node.parentElement) node = node.parentElement;
            return node;
        }
        return selector===true ? scope : scope.closest(selector)
    }
    window.$state = (object,selector=true,{property=object.target?.name,stop=true}={}) => {
        const target = object instanceof Event ? object.currentTarget : object,
            state = $closest(target,selector).state;
        if(object instanceof Event && property) {
            if(stop) object.stopImmediatePropagation();
            state[property] = object.target.value;
        }
        return state;
    }
    window.$data = (object,selector=true,{property=object.target?.name,stop=true}={}) => {
        const target = object instanceof Event ? object.currentTarget : object,
            dataset = $closest(target,selector).dataset;
        if(object instanceof Event && property) {
            if(stop) object.stopImmediatePropagation();
            dataset[property] = object.target.value;
        }
        return dataset;
    }
    window.$attribute = (object,selector=true,{property=object.target?.name,value=object.target?.value,stop=true}={}) => {
        const target = object instanceof Event ? object.currentTarget : object;
            el = $closest(target,selector);
        if(object instanceof Event && property) {
            if(stop) object.stopImmediatePropagation();
            el.setAttribute(property,value);
        }
        return el;
    }
    if(window.trui) {
        trui.add =  (t, ...els) => {
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
    }
})();