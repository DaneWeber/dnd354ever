
var tableempty=true;
var oddrow=true;
function searchAnchor(frm, spl)
{
    var idx;
    count=0;
    pr=true;
    tb=getTBody();
    clearTable(tb);
    for (idx=0;idx <spl.length;idx++)
    {
		var pageTitle = spl[idx][0];
		var pageFilename = spl[idx][1];
		var pageAnchors = spl[idx][2];
	    for (var anchor_idx=0;anchor_idx < pageAnchors.length; anchor_idx++)
	    {
			if (pr && checkAnchor(frm, pageAnchors[anchor_idx]))
	        {
	            count++;
	            if (count==frm.stop.value)
	            {
	                pr=confirm('More than '+frm.stop.value+' results found. List all?\n(It might take a while...)');
	            }
	            insertRow(tb, pageTitle, pageFilename, pageAnchors[anchor_idx]);
	        }
		}
	}
    if (tableempty) insertNoresults(tb);
    return count;
}
function checkAnchor(frm, anchor)
{
    var reply=true;
    if (reply && frm.name.value !='')
    {
        reply=false;
        txt=frm.name.value.toLowerCase();
        if (anchor[1].toLowerCase().indexOf(txt)>=0)
        {
            reply=true;
        }
    }
    return reply;
}
function insertRow(tb, pageTitle, pageFilename, anchor)
{if (tableempty)
    {insertHeader(tb);
        tableempty=false;
    }
    tdn=document.createElement("TD");
    tdn.innerHTML='<A href="JavaScript:openLink('+"'"+pageFilename+"#"+anchor[0]+"'"+')" style="color: rgb(87, 158, 182)">'+pageTitle+'&nbsp;&nbsp;</A>';
    tds =document.createElement("TD");
    if (anchor[1].substr(anchor[0].length-4) == "_top")
    {
        tds.innerHTML = "&lt;Top of page&gt;";
    }
    else
    {
        tds.innerHTML = anchor[1].substr(0,1).toUpperCase() + anchor[1].substr(1) +'&nbsp;';
        tds.innerHTML = tds.innerHTML.replace("Table ", "Table: ");
    }
    
    tr=document.createElement("TR");
    if (oddrow) tr.className='odd-row';
    tr.appendChild(tdn);
    tr.appendChild(tds);
    tb.appendChild(tr);
    oddrow=!oddrow;
    return true;
}
function getTBody()
{
    art_table=document.getElementsByTagName("TABLE")[2];
    return art_table.getElementsByTagName("TBODY")[0];
}
function replace(str, fnd, rpl)
{
    var idx;
    var a=str.split(fnd);
    reply='';
    sep='';
    for (idx=0;idx <a.length;idx++)
    {
        reply+=sep+a[idx];
        sep=rpl;
    }
    return reply;
}
function clearTable(tb)
{while (tb.getElementsByTagName('TR').length> 0)
    {
        tb.removeChild(tb.getElementsByTagName('TR')[0]);
    }
    oddrow=true;
    tableempty=true;
    return true;
}
function insertHeader(tb)
{
    thn =document.createElement("TD");
    thn.innerHTML ='<B>Top results may not be the most relevant</B>';
    tr=document.createElement("TR");
    tr.appendChild(thn);
    tb.appendChild(tr);

    thn =document.createElement("TD");
    thn.innerHTML ='<B>Page&nbsp;&nbsp;</B>';
    ths =document.createElement("TD");
    ths.innerHTML ='<B>Section&nbsp;&nbsp;</B>';
    tr=document.createElement("TR");
    tr.appendChild(thn);
    tr.appendChild(ths);
    tb.appendChild(tr);
    return true;
}
function insertNoresults(tb)
{
    td=document.createElement("TD");
    td.innerHTML ='<B>NO RESULTS FOUND</B>';
    tr=document.createElement("TR");
    tr.appendChild(td);
    tb.appendChild(tr);
    return true;
}
function openLink(lnk)
{if (window.opener)
    {
        window.opener.document.location.href=lnk;
        window.opener.focus();
    }else
    {
        var w=window.open(lnk, "anchor_detail", "scrollbars=yes,resizable=yes, toolbar=no, status=no, location=no, directories=no, screenX=10, screenY=20, top=20, left=10");
        w.focus();
    }
}
