let copy = (obj) => {
    // limitations: doesn't work if object contains methods
    return JSON.parse(JSON.stringify(obj))
}
let changed = (objA, objB) => {
    // limitations: doesn't account for reordering or 1 == true on checkboxes
    return JSON.stringify(objA) != JSON.stringify(objB)
}