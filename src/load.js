const load = async function({href,options}={}) {
    const ga = this.getAttribute.bind(this),
        u = new URL(href||ga("href")||ga("x-href"), document.baseURI),
        id = u.hash.split("#")[1],
        b = document.createElement('div'),
        s = (ga('target')||ga('x-target')||">#").split("#");
    u.hash = "";
    s[0]||=">";
    const r = await fetch(u.href,options);
    b.innerHTML =  await r.text();
    const e = s[1] ? doc.getElementById(s[1]) : this,
        h = id ? b.querySelector("#"+id).outerHTML : b.innerHTML,
        i = this.insertAdjacentHTML.bind(this);
    if(s[0]=="<") id ? e.replaceWith(b.getElementById(id)) : e.replaceWith(...b.childNodes);
    else if(s[0]===">") e.innerHTML = h;
    else if(s[0]==="<|") i('beforebegin', h);
    else if(s[0]==="|<") i('afterbegin', h);
    else if(s[0]===">|") i('beforeend', h);
    else if(s[0]==="|>") i('afterend', h);
    this.dispatchEvent(Object.defineProperty(new Event('loaded', {bubbles: true, cancelable: false}), 'target', {value: this}));
    return r.status === 200;
};
load.patchDOM = (root=document.body) => {
    [...root.querySelectorAll('[href]'),...root.querySelectorAll('[x-href]')].forEach(el => el.load = load);
}

export {load, load as default}