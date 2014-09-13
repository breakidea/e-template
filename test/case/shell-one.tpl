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
        <i href="#" class="c-icon c-icon-warning-circle-gray"></i>
        抱歉没有找到符合条件的信息，请尝试其他分类<br/ ><a href="<%seeMore%>" target="_blank" data-click="{rsv_click_type:\'more\'}">查看全部特卖>></a>
    </li>
<%}%>