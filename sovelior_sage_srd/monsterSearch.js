
var tableempty=true;var oddrow=true;var componentCheck=0
function searchMonster(frm, spl){var idx;count=0;pr=true;tb=getTBody();clearTable(tb);for (idx=0;idx <spl.length;idx++){if(pr && checkMonster(frm, spl[idx])){count++;if (count==frm.stop.value){pr=confirm('More than '+frm.stop.value+' results found. List all?\n(It might take a while...)');}
insertMonster(tb, spl[idx]);}}
if (tableempty) insertNoresults(tb);return count;}
function checkMonster(frm, spell){var reply=true;if (reply && frm.name.value !=''){reply=false;txt=frm.name.value.toLowerCase();if (spell[0].toLowerCase().indexOf(txt)>=0){reply=true;}
if (frm.shortd.checked==true && spell[7].toLowerCase().indexOf(txt)>=0){reply=true;}}
if (reply && frm.school.selectedIndex> 0){reply=false;txt=frm.school.value;if (spell[1].indexOf(txt)>=0){reply=true;}
if (spell[2].indexOf(txt)>=0){reply=true;}}
if (reply && frm.descriptor.selectedIndex> 0){reply=false;txt=frm.descriptor.value;if (spell[3].indexOf(txt)>=0){reply=true;}}
if (reply && frm.components.selectedIndex> 0){reply=false;txt=frm.components.value;if (spell[5].indexOf(txt)> 0){reply=true;}}
if (reply && (frm.cl.selectedIndex> 0 || frm.level.selectedIndex> 0)){reply=false;txt='';if (frm.cl.selectedIndex> 0){txt+=frm.cl.value;}
if (frm.level.selectedIndex> 0){txt+=' '+frm.level.value;}
if (spell[4].indexOf(txt)>=0){reply=true;}}
return reply;}
function insertMonster(tb, spell){if (tableempty){insertHeader(tb);tableempty=false;}
tdn=document.createElement("TD");tdn.innerHTML='<A href="JavaScript:openLink('+"'"+spell[6]+"'"+')" style="color: rgb(87, 158, 182)">'+spell[0]+'</A>';tds =document.createElement("TD");tds.innerHTML =spell[1]+'&nbsp;';tdsb=document.createElement("TD");tdsb.innerHTML=spell[2]+'&nbsp;';tdd =document.createElement("TD");tdd.innerHTML =spell[3]+'&nbsp;';tdl =document.createElement("TD");tdl.innerHTML =spell[4]+'&nbsp;';tdc =document.createElement("TD");tdc.innerHTML =spell[5]+'&nbsp;';tdsd=document.createElement("TD");tdsd.innerHTML=spell[7]+'&nbsp;';tr=document.createElement("TR");if (oddrow) tr.className='odd-row';tr.appendChild(tdn);tr.appendChild(tds);tr.appendChild(tdsb);tr.appendChild(tdd);tr.appendChild(tdl);tr.appendChild(tdc);tr.appendChild(tdsd);tb.appendChild(tr);oddrow=!oddrow;return true;}
function getTBody(){art_table=document.getElementsByTagName("TABLE")[2];return art_table.getElementsByTagName("TBODY")[0];}
function replace(str, fnd, rpl){var idx;var a=str.split(fnd);reply='';sep='';for (idx=0;idx <a.length;idx++){reply+=sep+a[idx];sep=rpl;}
return reply;}
function clearTable(tb){while (tb.getElementsByTagName('TR').length> 0){tb.removeChild(tb.getElementsByTagName('TR')[0]);}
oddrow=true;tableempty=true;return true;}
function insertHeader(tb){thn =document.createElement("TD");thn.innerHTML ='<B>Monster&nbsp;Name&nbsp;&nbsp;</B>';ths =document.createElement("TD");ths.innerHTML ='<B>Type&nbsp;&nbsp;</B>';thsb=document.createElement("TD");thsb.innerHTML='<B>Subtype&nbsp;&nbsp;</B>';thd =document.createElement("TD");thd.innerHTML ='<B>CR&nbsp;&nbsp;</B>';thc =document.createElement("TD");thc.innerHTML ='<B>LA&nbsp;&nbsp;</B>';thl =document.createElement("TD");thl.innerHTML ='<B>Environment&nbsp;&nbsp;</B>';thsd=document.createElement("TD");thsd.innerHTML='<B>Special&nbsp;Qualities&nbsp;&nbsp;&nbsp;&nbsp;</B>';tr=document.createElement("TR");tr.appendChild(thn);tr.appendChild(ths);tr.appendChild(thsb);tr.appendChild(thd);tr.appendChild(thl);tr.appendChild(thc);tr.appendChild(thsd);tb.appendChild(tr);return true;}
function insertNoresults(tb){td=document.createElement("TD");td.innerHTML ='<B>NO RESULTS FOUND</B>';tr=document.createElement("TR");tr.appendChild(td);tb.appendChild(tr);return true;}
function openLink(lnk){if (window.opener){window.opener.document.location.href=lnk;window.opener.focus();}else{var w=window.open(lnk, "spell_detail", "scrollbars=yes,resizable=yes, toolbar=no, status=no, location=no, directories=no, screenX=10, screenY=20, top=20, left=10");w.focus();}}

