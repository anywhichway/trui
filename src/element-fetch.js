(() => {
    const doc= document,
        dp = Object.defineProperty;
    HTMLElement.prototype.fetch = async function (event,{href,options,preventDefault=true}={}) {
        if(event && preventDefault) event.preventDefault();
        const ga = this.getAttribute,
            c = this.firstElementChild,
            u = new URL(href||ga.call(this,"href")||ga.call(this,"x-href")||(c?.tagName==="A" && c?.classList.contains("rhtml") ? ga.call(c,"href") : null), document.baseURI),
            b = document.createElement('div'),
            s = (ga.call(this,'target')||ga.call(this,'x-target')||(c?.tagName==="A" && c?.classList.contains("rhtml") ? ga.call(c,"target") : null)||">#").split("#");
        let id = u.hash.split("#")[1];
        if(s?.includes("::")) [s[1],s[0]] = s.split("::"); // handle ::before and ::after
        s[0]||=">";
        u.hash = "";
        const render = html => {
            b.innerHTML =  html;
            const e = s[1] ? doc.getElementById(s[1]) : this,
                h = id ? b.querySelector("#" + id).innerHTML : b.innerHTML;
            if (s[0] == "<") id ? e.replaceWith(b.getElementById(id)) : e.replaceWith(...b.childNodes);
            else if (s[0] === ">") { e.innerHTML = h; !c||(c.hidden=true); !c||e.insertAdjacentElement('afterbegin', c); }
            else if (s[0] === "<|") { e.insertAdjacentHTML('beforebegin', h); }
            else if (s[0] === "|<" || s[0] === "before") { c ? (c.insertAdjacentHTML('afterend',h),c.hidden=true) : e.insertAdjacentHTML('afterbegin', h); }
            else if (s[0] === ">|" || s[0] === "after") { !c||(c.hidden=true); e.insertAdjacentHTML('beforeend', h); }
            else if (s[0] === "|>") e.insertAdjacentHTML('afterend', h);
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
    doc.head.insertAdjacentHTML('beforeend', `<style>a[class="rhtml"]{text-decoration:none;cursor:pointer;color:unset;}</style>`);
    document.addEventListener('click', (event) => {
        // if event target is an anchor with class rhtml prevent default and return; otherwise handle normally
        if(event.target.tagName==="A" && event.target.classList.contains("rhtml")) {
            event.preventDefault();
        }
    })
})();