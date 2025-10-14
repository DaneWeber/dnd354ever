// Sviluppato da Mauro Donati
// Modified by Jason O. Jensen and Eric Jensen

var tableempty = true; var oddrow = true;

var componentCheck = 0

// invoked on form submit; empties the table from preceding searches,
// loops through the spell list, prints the spells in the results table.
function searchSpell(frm, spl) {
  var idx; count = 0; pr = true;
  tb = getTBody();
  clearTable(tb);
  for (idx = 0; idx < spl.length; idx++) {
    if(pr && checkSpell(frm, spl[idx])) {
      count++;
      if (count == frm.stop.value) {
        pr = confirm('More than ' + frm.stop.value + ' results found. List all?\n(It might take a while...)');
      }
      insertspell(frm, tb, spl[idx]);
    }
  }
  if (tableempty) insertNoresults(tb);
  return count;
}


// returns true/false if the spell satisfies the criteria
function checkSpell(frm, spell) {
  var reply = true;
// text and description
  if (reply && frm.name.value != '') {
    reply = false;
    txt = frm.name.value.toLowerCase();
    if (spell[0].toLowerCase().indexOf(txt) >= 0) {
      reply = true;
    }
    if (frm.shortd.checked == true && spell[7].toLowerCase().indexOf(txt) >= 0) {
      reply = true;
    }
    if (frm.target.checked == true && spell[10].toLowerCase().indexOf(txt) >= 0) {
      reply = true;
    }
  }

// school and subschool
  if (reply && frm.school.selectedIndex > 0) {
    reply = false;
    txt = frm.school.value;
    if (spell[1].indexOf(txt) >= 0) {
      reply = true;
    }
    if (spell[2].indexOf(txt) >= 0) {
      reply = true;
    }
  }

// descriptor
  if (reply && frm.descriptor.selectedIndex > 0) {
    reply = false;
    txt = frm.descriptor.value;
    if (spell[3].indexOf(txt) >= 0) {
      reply = true;
    }
  }


// component
if (componentCheck == 0)
  if (reply && frm.components.selectedIndex > 0) {
    reply = false;
    txt = frm.components.value;
    if (spell[5].indexOf(txt) > 0) {
      reply = true;
 }
}
if (componentCheck == 1)
  if (reply && frm.components.selectedIndex > 0) {
    reply = false;
    txt = frm.components.value;
    if (spell[5].indexOf(txt) < 0) {
      reply = true;
 }
}

// class and/or level
  if (reply && (frm.cl.selectedIndex > 0 || frm.level.selectedIndex > 0)) {
    reply = false; txt = '';
    if (frm.cl.selectedIndex > 0) {
      txt += frm.cl.value;
    }
    if (frm.level.selectedIndex > 0) {
      txt += ' ' + frm.level.value;
    }
    if (spell[4].indexOf(txt) >= 0) {
      reply = true;
    }
  }

// Saving throw
  if (reply && frm.savingthrow.selectedIndex > 0) {
    reply = false;
    txt = frm.savingthrow.value;
    if (spell[8].indexOf(txt) >= 0) {
      reply = true;
    }
  }
  
// Spell resistance
  if (reply && frm.spellresistance.selectedIndex > 0) {
    reply = false;
    txt = frm.spellresistance.value;
    if (spell[9].indexOf(txt) >= 0) {
      reply = true;
    }
  }
  
// Target/Area/Effect
  if (reply && frm.effect.selectedIndex > 0) {
    reply = false;
    txt = frm.effect.value;
    if (spell[10].indexOf(txt) >= 0) {
      reply = true;
    }
  }

  return reply;
}


// inserts a spell row in the results table
function insertspell(frm, tb, spell) {
  if (tableempty) {
    insertHeader(frm, tb);
    tableempty = false;
  }
  tdn = document.createElement("TD");
  tdn.innerHTML = '<A href="JavaScript:openLink(' + "'" + spell[6] + "'" + ')" style="color: rgb(87, 158, 182)">' + spell[0] + '</A>';

  if (frm.ts.checked == true) {  tds  = document.createElement("TD"); tds.innerHTML  = spell[1] + '&nbsp;'};
  if (frm.tsb.checked == true) {tdsb = document.createElement("TD"); tdsb.innerHTML = spell[2] + '&nbsp;'};
  if (frm.td.checked == true) {tdd  = document.createElement("TD"); tdd.innerHTML  = spell[3] + '&nbsp;'};
  if (frm.tl.checked == true) {tdl  = document.createElement("TD"); tdl.innerHTML  = spell[4] + '&nbsp;'};
  if (frm.tc.checked == true) {tdc  = document.createElement("TD"); tdc.innerHTML  = spell[5] + '&nbsp;'};
  if (frm.tst.checked == true) {tdst  = document.createElement("TD"); tdst.innerHTML  = spell[8] + '&nbsp;'};
  if (frm.tsr.checked == true) {tdsr  = document.createElement("TD"); tdsr.innerHTML  = spell[9] + '&nbsp;'};
  if (frm.tt.checked == true) {tdt  = document.createElement("TD"); tdt.innerHTML  = spell[10] + '&nbsp;'};
  if (frm.tsd.checked == true) {tdsd = document.createElement("TD"); tdsd.innerHTML = spell[7] + '&nbsp;'};

  tr = document.createElement("TR");
  if (oddrow) tr.className = 'odd-row'; //tr.setAttribute('class', 'odd-row');
  tr.appendChild(tdn);  
  if (frm.ts.checked == true) {tr.appendChild(tds)};  
  if (frm.tsb.checked == true) {tr.appendChild(tdsb)};
  if (frm.td.checked == true) {tr.appendChild(tdd)};  
  if (frm.tl.checked == true) {tr.appendChild(tdl)};  
  if (frm.tc.checked == true) {tr.appendChild(tdc)};
  if (frm.tst.checked == true) {tr.appendChild(tdst)};
  if (frm.tsr.checked == true) {tr.appendChild(tdsr)};
  if (frm.tt.checked == true) {tr.appendChild(tdt)};
  if (frm.tsd.checked == true) {tr.appendChild(tdsd)}; 
  tb.appendChild(tr);
  
  oddrow = !oddrow;
  return true;
}

// Gets the TBODY object. please, note that in case of modification of searchsp.html,
// the number [2] in the second line should be changed accordingly.
// This number must be equal to the number of <TABLE> tags that precede the empty
// spell results TABLE (at the moment, it is the 3rd <TABLE> tag, then "[2]").
function getTBody() {
  art_table = document.getElementsByTagName("TABLE")[2];
  return art_table.getElementsByTagName("TBODY")[0];
}

// for future use.
function replace(str, fnd, rpl) {
  var idx;
  var a = str.split(fnd);
  reply = ''; sep = '';
  for (idx = 0; idx < a.length; idx++) {
    reply += sep + a[idx];
    sep = rpl;
  }
  return reply;
}

// empties the table from the preceding search results.
function clearTable(tb) {
  while (tb.getElementsByTagName('TR').length > 0) {
    tb.removeChild(tb.getElementsByTagName('TR')[0]);
  }
  oddrow = true; tableempty = true;
  return true;
}

// inserts the "Spell School Subschool ..." header at the top of the table.
function insertHeader(frm, tb) {
  thn  = document.createElement("TD"); thn.innerHTML  = '<B>Spell&nbsp;Name&nbsp;&nbsp;</B>';
  if (frm.ts.checked == true) {ths  = document.createElement("TD"); ths.innerHTML  = '<B>School&nbsp;&nbsp;</B>'};
  if (frm.tsb.checked == true) {thsb = document.createElement("TD"); thsb.innerHTML = '<B>Subschool&nbsp;&nbsp;</B>'};
  if (frm.td.checked == true) {thd  = document.createElement("TD"); thd.innerHTML  = '<B>Descriptor&nbsp;&nbsp;</B>'};
  if (frm.tc.checked == true) {thc  = document.createElement("TD"); thc.innerHTML  = '<B>Components&nbsp;&nbsp;</B>'};
  if (frm.tl.checked == true) {thl  = document.createElement("TD"); thl.innerHTML  = '<B>Class/Level&nbsp;&nbsp;</B>'};
  if (frm.tst.checked == true) {thst  = document.createElement("TD"); thst.innerHTML  = '<B>Saving Throw&nbsp;&nbsp;</B>'};
  if (frm.tsr.checked == true) {thsr  = document.createElement("TD"); thsr.innerHTML  = '<B>Spell Resistance&nbsp;&nbsp;</B>'};
  if (frm.tt.checked == true) {tht  = document.createElement("TD"); tht.innerHTML  = '<B>Target/Area/Effect&nbsp;&nbsp;</B>'};
  if (frm.tsd.checked == true) {thsd = document.createElement("TD"); thsd.innerHTML = '<B>Short&nbsp;Description&nbsp;&nbsp;&nbsp;&nbsp;</B>'};

  tr = document.createElement("TR");
  tr.appendChild(thn);  
  if (frm.ts.checked == true) {tr.appendChild(ths)};  
  if (frm.tsb.checked == true) {tr.appendChild(thsb)};
  if (frm.td.checked == true) {tr.appendChild(thd)};  
  if (frm.tl.checked == true) {tr.appendChild(thl)};  
  if (frm.tc.checked == true) {tr.appendChild(thc)};
  if (frm.tst.checked == true) {tr.appendChild(thst)};
  if (frm.tsr.checked == true) {tr.appendChild(thsr)};
  if (frm.tt.checked == true) {tr.appendChild(tht)};
  if (frm.tsd.checked == true) {tr.appendChild(thsd)}; 
  tb.appendChild(tr);
  return true;
}

// inserts a "NO RESULTS FOUND" header
function insertNoresults(tb) {
if (i == 0)
  td = document.createElement("TD"); td.innerHTML  = '0';
  tr = document.createElement("TR");
  tr.appendChild(td); tb.appendChild(tr);
  return true;
if (i == 1)
  td = document.createElement("TD"); td.innerHTML  = '1';
  tr = document.createElement("TR");
  tr.appendChild(td); tb.appendChild(tr);
  return true;
if (i == 2)
  td = document.createElement("TD"); td.innerHTML  = '2';
  tr = document.createElement("TR");
  tr.appendChild(td); tb.appendChild(tr);
  return true;

}


function openLink(lnk) {
  if (window.opener) {
    window.opener.document.location.href = lnk;
    window.opener.focus();
  } else {
    var w = window.open(lnk, "spell_detail", "scrollbars=yes,resizable=yes, toolbar=no, status=no, location=no, directories=no, screenX=10, screenY=20, top=20, left=10");
    w.focus();
  }
}

