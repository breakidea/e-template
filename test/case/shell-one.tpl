<!-- index: {clean: 1} -->
<title><%title%></title>
<meta name-"version" content="<%:name%>(<%:version%>)">
<ul>
    <%for(var i = 0; i < repositories.length; i++){var item = repositories[i];%>
        <li><%item.name|truncate:15:"..."%>(<%=item.star%>)</li>
    <%}%>
</ul>
<%if(online){%>
    <a href="//www.baidu.com/s?wd=<%:title%>" data=url="<%errorUrl%>">点击这里</a>
<%}%>