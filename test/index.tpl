<%tplData.title|escape:"html"%>/<%tplData.name%>
<%for(var i = 0; i < tplData.list['length']; i++) {%>
    <li>
        <span><%tplData.list[i].date%></span>
        <b><%=tplData.list[i].title%></b>
    </li>
<%}%>