(() => {
    const doc= document,
        dp = Object.defineProperty;
    HTMLElement.prototype.fetch = async function (event,{href,options,preventDefault=true}={}) {
        if(event && preventDefault) event.preventDefault();
        const ga = this.getAttribute,
            p = this.previousElementSibling,
            u = new URL(href||ga.call(this,"href")||ga.call(this,"x-href")||(p.tagName==="LINK" ? ga.call(p,"href") : null), document.baseURI),
            b = document.createElement('div'),
            s = (ga.call(this,'target')||ga.call(this,'x-target')||(p.tagName==="LINK" ? ga.call(p,"target") : null)||">#").split("#");
        let id = u.hash.split("#")[1];
        if(s?.includes("::")) [s[1],s[0]] = s.split("::"); // handle ::before and ::after
        s[0]||=">";
        u.hash = "";
        const render = html => {
            b.innerHTML =  html;
            const e = s[1] ? doc.getElementById(s[1]) : this,
                h = id ? b.querySelector("#" + id).innerHTML : b.innerHTML,
                i = this.insertAdjacentHTML.bind(e);
            if (s[0] == "<") id ? e.replaceWith(b.getElementById(id)) : e.replaceWith(...b.childNodes);
            else if (s[0] === ">") e.innerHTML = h;
            else if (s[0] === "<|") i('beforebegin', h);
            else if (s[0] === "|<" || s[0] === "before") i('afterbegin', h);
            else if (s[0] === ">|" || s[0] === "after") i('beforeend', h);
            else if (s[0] === "|>") i('afterend', h);
        }
        let result = false;
        if(["http:","https:"].includes(u.protocol)) {
            u.search = "";
            let t;
            if(u.origin===doc.location.origin && u.pathname===doc.location.pathname) {
                t = doc.documentElement.innerHTML;
                result = true;
            } else {
                const r = await fetch(u.href,options);
                t = await r.text();
                result = r.status===200;
            }
            render(t);
            this.dispatchEvent(dp(new Event('load', {false: true, cancelable: false}), 'target', {value: this}));
        } else if(["ws:","wss"].includes(u.protocol)) {
            options ||= {};
            options.body ||= u.searchParams.get("message");
            u.search = "";
            if(!this.ws) {
                this.ws ||= new WebSocket(u.href);
                this.ws.onmessage = e => render(e.data);
                this.ws.onopen = e => {
                    this.ws.send(`{"url":"/${id}","options":"${JSON.stringify(options)}"}`);
                    el.dispatchEvent(dp(new Event('load', {false: true, cancelable: false}), 'target', {value: this}));
                }
            } else {
                this.ws.send(`{"url":"/${id}","options":"${JSON.stringify(options)}"}`);
            }
        }
        return result;
    };
    const div = document.createElement("div");
    div.style.display = "none";
    doc.head.appendChild(div);
    const tagNames  = [
        'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo',
        'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col',
        'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt',
        'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3',
        'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input',
        'ins', 'kbd', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'meta', 'meter', 'nav',
        'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'pre',
        'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'slot',
        'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody',
        'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u',
        'ul', 'var', 'video', 'wbr'
        ],
        styles = tagNames.map(tagName => {
            // convert computed style into a string
            const el = doc.createElement(tagName);
            div.appendChild(el);
            const style = getComputedStyle(el),
                cssText = [...style].map(name => `${name}:${style.getPropertyValue(name)}`).join(";");
            return `.r-${tagName}{${cssText}}`;
        }).join("\n") + '\na[class^="r-"]{text-decoration:none;cursor:pointer;color:unset;}';
    div.remove();
    doc.head.insertAdjacentHTML('beforeend', `<style>${styles}</style>`);
    HTMLElement.prototype.fetch.styles = styles;
})();