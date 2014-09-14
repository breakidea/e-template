<!-- title: {corp: true} -->
这里是标题

<!-- index: {clean: 0, apply:['title', 'name', 'online', 'errorUrl', 'repositories', 'version']} -->
<title><%title%></title>
<meta name-"version" content="<%:name%>(<%:version%>)">
<ul>
    <%for(var i = 0; i < repositories.length; i++){var item = repositories[i];%>
        <li><%item.name|limitlen:15:"..."%>(<%=item.star%>)</li>
    <%}%>
</ul>
<%if(online){%>
    <a href="//www.baidu.com/s?wd=<%:title%>" data=url="<%errorUrl%>">点击这里</a>
<%}%>

<!-- footer: {section:"s-footer"} -->
<footer>copyright</footer>