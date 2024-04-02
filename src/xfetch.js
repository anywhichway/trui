(() => {
    const doc= document,
        dp = Object.defineProperty;
    window.xfetch = async function (event,{href,options,preventDefault=true}={}) {
        const self = event.currentTarget;
        if(event && preventDefault) event.preventDefault();
        const ga = self.getAttribute,
            c = self.firstElementChild,
            u = new URL(href||ga.call(self,"href")||ga.call(self,"x-href")||(c?.tagName==="A" && c?.classList.contains("xfetch") ? ga.call(c,"href") : null), document.baseURI),
            b = document.createElement('div'),
            s = (ga.call(self,'target')||ga.call(self,'x-target')||(c?.tagName==="A" && c?.classList.contains("xfetch") ? ga.call(c,"target") : null)||">#").split("#");
        let id = u.hash.split("#")[1];
        if(s?.includes("::")) [s[1],s[0]] = s.split("::"); // handle ::before and ::after
        s[0]||=">";
        u.hash = "";
        const render = html => {
            const l = s[0];
            b.innerHTML =  html;
            const e = s[1] ? doc.getElementById(s[1]) : self,
                h = id ? (b.querySelector("#" + id)||b).innerHTML : b.innerHTML;
            if (l == "<") id ? e.replaceWith(b.getElementById(id)) : e.replaceWith(...b.childNodes);
            else if (l === ">") { e.innerHTML = h; !c||(c.hidden=true); !c||e.insertAdjacentElement('afterbegin', c); }
            else if (l === "<|") { e.insertAdjacentHTML('beforebegin', h); }
            else if (l === "|<" || l === "before") { c ? (c.insertAdjacentHTML('afterend',h),c.hidden=true) : e.insertAdjacentHTML('afterbegin', h); }
            else if (l === ">|" || l === "after") { !c||(c.hidden=true); e.insertAdjacentHTML('beforeend', h); }
            else if (l === "|>") e.insertAdjacentHTML('afterend', h);
            if(e.resolve) e.resolve();
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
            let target = ["<","<|","|>"].includes(s[0]) ? self.parentElement : self;
            target.id ||= Math.random().toString(36).slice(2);
            history.pushState({targetId:target.id,html:target.innerHTML},"");
            render(t);
            self.dispatchEvent(dp(new Event('load', {false: true, cancelable: false}), 'target', {value: self}));
        } else if(["ws:","wss"].includes(u.protocol)) {
            options ||= {};
            options.body ||= u.searchParams.get("message");
            u.search = "";
            if(!self.ws) {
                self.ws ||= new WebSocket(u.href);
                self.ws.onmessage = e => render(e.data);
                self.ws.onopen = e => {
                    self.ws.send(`{"url":"/${id}","options":"${JSON.stringify(options)}"}`);
                    el.dispatchEvent(dp(new Event('load', {false: true, cancelable: false}), 'target', {value: self}));
                }
            } else {
                self.ws.send(`{"url":"/${id}","options":"${JSON.stringify(options)}"}`);
            }
        }
        return result;
    };
    doc.head.insertAdjacentHTML('beforeend', `<style>a[class="xfetch"]{text-decoration:none;cursor:pointer;color:unset;}</style>`);
    document.addEventListener('click', (event) => {
        // if event target is an anchor with class xftech prevent default and return; otherwise handle normally
        if(event.target.tagName==="A" && event.target.classList.contains("xfetch")) {
            event.preventDefault();
        }
    })
    window.addEventListener("popstate", (event) => {
        const state = event.state;
        if(state) {
            const el = doc.getElementById(state.targetId);
            if(el) el.innerHTML = state.html;
        }
    })
})();