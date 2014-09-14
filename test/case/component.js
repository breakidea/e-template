this.render = function(data, _) {
    data = data || {};
    _ = _ || {};
    _.extend = function(o) {
        for (var k in o) {
            this[k] = o[k];
        }
    };
    _.extend(this._);
    var html = "";
    with(data) {
        html += "<footer>copyright</footer>";
    }
    return html;
};