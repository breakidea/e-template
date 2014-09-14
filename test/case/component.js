this.render = function(data, _) {
    data = data || {};
    _ = _ || {};
    for (var k in this._) {
        _[k] = this._[k];
    }
    var html = "";
    with(data) {
        html += "<footer>copyright</footer>";
    }
    return html;
};