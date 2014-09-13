if (list.length) {
    html += _.limitlen(title, 20, "...");
    for (var i = 0; i < list.length; i++) {
        var item = list[i];
        html += "<li class=\"cl-item moz-clear\" data-click=\"{rsv_click_mid:'";
        html += _.encode(item.mid);
        html += "',rsv_click_index: ";
        html += _.encode(i);
        html += "}\"><span class=\"ul-misc-slo-promotion moz-dummy\">";
        html += _.escape(item.promotion, 'none');
        html += "</span></li>";
    }
} else {
    html += "<li class=\"cl-more\">抱歉没有找到符合条件的信息，请尝试其他分类>>></li>";
}