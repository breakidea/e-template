<!--x-template:{"innerLang":1, "strip": 1, "variable": "s", "prefix": "cache.render"}-->
<%if (list.length){%>
    <%title|limitlen: 20: "..."%>
    <%for(var i = 0; i < list.length; i++){%>
        <%var item = list[i];%>
        <li class="cl-item moz-clear" data-click="{rsv_click_mid:'<%item.mid%>',rsv_click_index: <%i%>}">
            <span class="ul-misc-slo-promotion moz-dummy"><%item.promotion|escape:'none'%></span>
        </li>
    <%}%>
<%}else{%>
    <li class="cl-more">
        <a>查看全部特卖>></a>
    </li>
<%}%>