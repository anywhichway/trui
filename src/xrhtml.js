(() => {
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
    window.$state = (object,selector=true,{property=object.target?.name,value=object.target?.value,stop=true}={}) => {
        const target = object instanceof Event ? object.currentTarget : object,
            state = $closest(target,selector).state;
        if(object instanceof Event && property) {
            if(stop) object.stopImmediatePropagation();
            state[property] = parse(value);
        }
        return state;
    }
    window.$data = (object,selector=true,{property=object.target?.name,value=object.target?.value,stop=true}={}) => {
        const target = object instanceof Event ? object.currentTarget : object,
            dataset = $closest(target,selector).dataset;
        if(object instanceof Event && property) {
            if(stop) object.stopImmediatePropagation();
            dataset[property] = value;
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
    window.$ = (qs) => document.querySelector(qs);

    window.element = (html,{state,properties}={}) => {
        const div = document.createElement("div");
        div.innerHTML = html;
        const el = div.firstElementChild;
        if(properties) {
            Object.entries(Object.getOwnPropertyDescriptors(properties)).forEach(([key,desc]) => Object.defineProperty(el,key,desc));
            if(properties.oncreate) properties.oncreate(dp(new Event('create', {bubbles: true, cancelable: false}), 'target', {value: el}));
        }
        if(state) {
            el.state.assign(state);
            el.resolve(true);
        }
        return el;
    }
})();