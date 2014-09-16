<!-- index: {clean: 1, apply:['title', 'name', 'online', 'errorUrl', 'repositories', 'version', 'xss']} -->
<title><%title%></title>
<meta name-"version" content="<%:name%>(<%:version%>)">
<ul>
    <%for(var i = 0; i < repositories.length; i++){var item = repositories[i];%>
        <li><%item.name|truncate:15:"..."%>(<%=item.star%>)</li>
    <%}%>
</ul>
<%if(online){%>
    <a href="//www.baidu.com/s?wd=<%:title%>">点击这里</a>
<%}%>
<!-- 
XSS:
<font><%xss%></font>
<font><%:xss%></font>
<script>var xss = "<%=_.escapeJs(xss)|cat: "//这里是注释"%>\n<\/script>";</script>
-->
