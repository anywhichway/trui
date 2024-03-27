const load = async function() {
    const u = new URL(this.getAttribute("href"), document.baseURI),
        id = u.hash.split("#")[1],
        b = document.createElement('div'),
        s = (this.getAttribute('target')||">#").split("#");
    u.hash = "";
    s[0]||=">";
    b.innerHTML =  await fetch(u.href).then(r => r.text());
    const e = s[1] ? doc.getElementById(s[1]) : this,
        h = id ? b.getElementById(id).outerHTML : b.innerHTML,
        i = this.insertAdjacentHTML.bind(this);
    if(s[0]=="<") id ? e.replaceWith(b.getElementById(id)) : e.replaceWith(...b.childNodes);
    else if(s[0]===">") e.innerHTML = h;
    else if(s[0]==="<|") i('beforebegin', h);
    else if(s[0]==="|<") i('afterbegin', h);
    else if(s[0]===">|") i('beforeend', h);
    else if(s[0]==="|>") i('afterend', h);
    this.dispatchEvent(Object.defineProperty(new Event('load', {bubbles: true, cancelable: false}), 'target', {value: this}));
};
load.patchDOM = (root=document.body) => {
    [...root.querySelectorAll('[href]')].forEach(el => el.load = load);
}

export {load, load as default}