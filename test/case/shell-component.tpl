<!--x-template:{"clean": 0, apply: ['list', 'title','platMore']}-->
<%if (list.length){%>
    <%for(var i = 0; i < list.length; i++){%>
        <%var item = list[i];%>
        <li class="cl-item moz-clear" data-click="{rsv_click_mid:'<%item.mid%>',rsv_click_index: <%i%>}">
            <a class="ul-logo EC_ZHIXIN" target="_blank" href="<%item.url%>" data-click="{rsv_click_type:'item_image'}">
                <img src="<%item.brandlogo%>" width="96" height="48" alt="<%item.title%>"/>
            </a>
            <div class="ul-misc">
                <div class="ul-misc-title moz-overflow" data-click="{rsv_click_type:'item_title'}">
                    <a class="EC_ZHIXIN" target="_blank" href="<%item.url%>">
                        <%item.title%>
                    </a>
                </div>
                <a class="ul-misc-slo moz-overflow EC_ZHIXIN" target="_blank" href="<%item.url%>" data-click="{rsv_click_type:'item_promotion'}">
                    <%if (item.left_day > 0) {%>
                        <span class="ul-misc-slo-time"><%item.lasttime%></span>
                    <%}%>
                    <span class="ul-misc-slo-promotion moz-dummy"><%item.promotion|escape:'none'%></span>
                </a>
                <%if (item.source){%>
                    <div class="ul-misc-platform">
                        商家：
                        <a class="EC_ZHIXIN moz-dummy" target="_blank" href="<%platMore%>&platform=<%:item.source%>" data-click="{rsv_click_type:'item_source'}">
                            <%item.source|escape:'none'%>
                        </a>
                        <%if(item.yhq){%>
                            <a target="_blank" href="<%item.yhq%>" data-click="{rsv_click_type:'item_quan'}" class="c-text c-text-danger EC_ZHIXIN" title="优惠券">券</a>
                        <%}%>
                    </div>
                <%}%>
            </div>
            <%if(!item.btntext){item.btntext = item.material_type == 4 ? "进入店铺" : "立即抢购";}%>
            <div class="ul-purchase">
                <a class="ul-rebate moz-dummy EC_ZHIXIN" target="_blank" href="<%item.url%>" data-click="{rsv_click_type:'item_rebate'}"><%=item.rebate%></a>
                <a class="c-btn c-btn-primary EC_ZHIXIN" target="_blank" href="<%item.url%>" title="<%item.btntext|escape:'html'%>" data-click="{rsv_click_type:'item_button'}">
                    <%item.btntext%>
                </a>
            </div>
        </li>
    <%}%>
<%}else{%>
    <li class="cl-more">
        <i href="#" class="c-icon c-icon-warning-circle-gray"></i>
        抱歉没有找到符合条件的信息，请尝试其他分类<br/ ><a href="<%seeMore%>" target="_blank" data-click="{rsv_click_type:\'more\'}">查看全部特卖>></a>
    </li>
<%}%>