Store.prototype.getResources = function () {
    let resources = [];
    for (const i in this) {
        if (RESOURCES_ALL.includes(i)&& this[i] > 0) {
            resources.push(i)
        }
    }
    return resources

}