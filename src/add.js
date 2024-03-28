const add = (t, ...els) => {
    let w = "beforeend";
    if(t.constructor.name==="Object") {
        w = t.where || "beforeend";
        t = t.target;
    }
    let n = t
    for(let e of els.flatMap()) {
        n.insertAdjacentElement(w,e);
        if(w!=="afterend") w = "afterend";
        n = e;
    }
}

export {add, add as default}