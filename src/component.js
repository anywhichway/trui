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
})();