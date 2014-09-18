<!--config: {"clean":0, strip: 0, apply: ['title', 'name', 'repositories', 'online', 'version']}-->
<title><%title|truncate:20:"..."%></title>
<meta name-"version" content="<%:name%>(<%:version%>)">
<ul>
    <%for(var i = 0; i < repositories.length; i++){var item = repositories[i];%>
        <li><%item.name|truncate:15:"..."%>(<%=item.star%>)</li>
    <%}%>
</ul>
<%if(online){%>
    <a href="//www.baidu.com/s?wd=<%:title%>">点击这里</a>
<%}%>