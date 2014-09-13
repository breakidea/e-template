if (list.length) {
    for (var i = 0; i < list.length; i++) {
        var item = list[i];
        html += "<li class=\"cl-item moz-clear\" data-click=\"{rsv_click_mid:'";
        html += _.encode(item.mid);
        html += "',rsv_click_index: ";
        html += _.encode(i);
        html += "}\"><a class=\"ul-logo EC_ZHIXIN\" target=\"_blank\" href=\"";
        html += _.encode(item.url);
        html += "\" data-click=\"{rsv_click_type:'item_image'}\"><img src=\"";
        html += _.encode(item.brandlogo);
        html += "\" width=\"96\" height=\"48\" alt=\"";
        html += _.encode(item.title);
        html += "\"/></a><div class=\"ul-misc\"><div class=\"ul-misc-title moz-overflow\" data-click=\"{rsv_click_type:'item_title'}\"><a class=\"EC_ZHIXIN\" target=\"_blank\" href=\"";
        html += _.encode(item.url);
        html += "\">";
        html += _.encode(item.title);
        html += "</a></div><a class=\"ul-misc-slo moz-overflow EC_ZHIXIN\" target=\"_blank\" href=\"";
        html += _.encode(item.url);
        html += "\" data-click=\"{rsv_click_type:'item_promotion'}\">";
        if (item.left_day > 0) {
            html += "<span class=\"ul-misc-slo-time\">";
            html += _.encode(item.lasttime);
            html += "</span>";
        }
        html += "<span class=\"ul-misc-slo-promotion moz-dummy\">";
        html += _.escape(item.promotion, 'none');
        html += "</span></a>";
        if (item.source) {
            html += "<div class=\"ul-misc-platform\">商家：<a class=\"EC_ZHIXIN moz-dummy\" target=\"_blank\" href=\"";
            html += _.encode(platMore);
            html += "&platform=";
            html += _.encodeURIComponent(item.source);
            html += "\" data-click=\"{rsv_click_type:'item_source'}\">";
            html += _.escape(item.source, 'none');
            html += "</a>";
            if (item.yhq) {
                html += "<a target=\"_blank\" href=\"";
                html += _.encode(item.yhq);
                html += "\" data-click=\"{rsv_click_type:'item_quan'}\" class=\"c-text c-text-danger EC_ZHIXIN\" title=\"优惠券\">券</a>";
            }
            html += "</div>";
        }
        html += "</div>";
        if (!item.btntext) {
            item.btntext = item.material_type == 4 ? "进入店铺": "立即抢购";
        }
        html += "<div class=\"ul-purchase\"><a class=\"ul-rebate moz-dummy EC_ZHIXIN\" target=\"_blank\" href=\"";
        html += _.encode(item.url);
        html += "\" data-click=\"{rsv_click_type:'item_rebate'}\">";
        html += _.raw(item.rebate);
        html += "</a><a class=\"c-btn c-btn-primary EC_ZHIXIN\" target=\"_blank\" href=\"";
        html += _.encode(item.url);
        html += "\" title=\"";
        html += _.escape(item.btntext, 'html');
        html += "\" data-click=\"{rsv_click_type:'item_button'}\">";
        html += _.encode(item.btntext);
        html += "</a></div></li>";
    }
} else {
    html += "<li class=\"cl-more\"><i href=\"#\" class=\"c-icon c-icon-warning-circle-gray\"></i>抱歉没有找到符合条件的信息，请尝试其他分类<br/ ><a href=\"";
    html += _.encode(seeMore);
    html += "\" target=\"_blank\" data-click=\"{rsv_click_type:\\'more\\'}\">查看全部特卖>></a></li>";
}