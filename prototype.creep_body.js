Creep.prototype.getBodyCost = function () {
    var cost = 0;
    for (part in this.body) {
        let t = this.body[part].type;
        cost += CreepBody.filter(function (r) { return r.Part == t })[0].Cost;
    }

    return cost;
};