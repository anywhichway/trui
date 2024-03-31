(() => {
    const doc= document,
        dp = Object.defineProperty;
HTMLElement.prototype.fetch = async function ({href,options}={}) {
    const ga = this.getAttribute.bind(this),
        u = new URL(href||ga("href")||ga("x-href"), document.baseURI),
        b = document.createElement('div'),
        s = (ga('target')||ga('x-target')||">#").split("#");
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
    } else if(["ws:","wss"].includes(u.protocol)) {
        options ||= {};
        options.body ||= u.searchParams.get("message");
        u.search = "";
        if(!this.ws) {
            this.ws ||= new WebSocket(u.href);
            this.ws.onmessage = e => render(e.data);
            this.ws.onopen = e => this.ws.send(`{"url":"/${id}","options":"${JSON.stringify(options)}"}`);
        } else {
            this.ws.send(`{"url":"/${id}","options":"${JSON.stringify(options)}"}`);
        }
    }
    this.dispatchEvent(dp(new Event('loaded', {bubbles: true, cancelable: false}), 'target', {value: this}));
    return result;
};
doc.addEventListener('DOMContentLoaded', () => {
    [...doc.querySelectorAll('[href]'),...document.querySelectorAll('[x-href]')].forEach(el => {
        if(!el.loaded) {
            dp(el,"loaded",{value:true});
            el.dispatchEvent(dp(new Event('load', {bubbles: true, cancelable: false}), 'target', {value: el}));
        }
    });
});
})();