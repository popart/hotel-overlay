//
// copyright (c) 2010 gordon anderson [anderson web systems]
//


    function byid(sid)
    {
        return document.getElementById(sid);
    }

    function svg_hide(svgid)
    {
        var svgelt = byid(svgid);
        if (svgelt)
            svgelt.style.display='none';
    }
    
    function svg_show(svgid)
    {
        var svgelt = byid(svgid);
        if (svgelt)
            svgelt.style.display='inline';
    }

    function url_param(name)
    {
      name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
      var regexS = "[\\?&]"+name+"=([^&#]*)";
      var regex = new RegExp( regexS );
      var results = regex.exec( window.location.href );
      if( results == null )
        return "";
      else
        return results[1];
    }

    var mx=0;
    var my=0;
    var lot_id = '';
    var curr_level = 'g';
    var pop;
    var popup_cleanups=[];
    var callout_cleanups=[];
    var direct = {};


    function hidden_lot(id)
    {
        return (byid(id).parentNode.id=='l1_lots_hidden_temporarily');
    }


    function init_directory()
    {
        // data structure : direct[first_letter][store_name] -> array of lot ids 

        function direct_set(nam, id)
        {
            var let = nam[0];

            if (hidden_lot(id))
                return;


            if (let>='0' && let<='9')
                let='#';

            if (!direct[let])
                direct[let] = {};
            if (!direct[let][nam])
                direct[let][nam] = [];

            direct[let][nam].push(id);
        }

        // put each item into the directory structure

        for (var id in info) 
        {
            // put cafe name into directory

            var inf = info[id];
            direct_set(inf.name, id);

            // split tags, add a directory entry for tag -> lot id

            if (inf.tags)
            {
                var tags = inf.tags.split(',');
                for (var i in tags)
                {
                    direct_set(tags[i], id);
                }
            }
        }
    }

    var gob;

    function find_parent_tag(tag,elt)
    {
        var p=elt;
        while(p=p.parentNode)
        {
            if (p.tagName==tag)
                return p;
        }
        return NULL;
    }

    function init_directory_alphabet()
    {
        var X0=-27.0;
        var dX = Math.floor((byid('dir_base_letter').getBBox().width + 0.5)*0.70);

        function append_letter(let)
        {
            var gl = byid('dir_base_letter').cloneNode(true);
            X0 += dX;

            gl.setAttribute('transform','matrix(0.70,0,0,0.70,'+(231.0+X0)+',518.0)');

            byid('dir_base_letter').parentNode.appendChild(gl);
            gl.getElementsByTagName('text')[0].getElementsByTagName('tspan')[0].textContent = let;

            var bbox = gl.getBBox();

            var menumap = direct[ let ];
            gl.onmouseover = function(evt) { 
                //console.log('Directory letter : '+let);

                var g = find_parent_tag('g', evt.target);
                var T = g.getAttribute('transform');
                var M = T.split('(')[1].split(')')[0].split(',');
                var x=M[4];
                var y=M[5];

                create_popup_menu(x,y,menumap);
            };
            gl.onmouseout = function() {
                //cleanup_nodes(popup_cleanups);
            };
            gl.setAttribute('cursor','default');
        }

        var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (var i in alphabet)
            append_letter(alphabet[i]); 
        append_letter('#'); 

        byid('dir_base_letter').setAttribute('display','none')
    }

    
    function cleanup_nodes(nodes)
    {
        for (var i in nodes)
        {
            var nd=nodes[i];
            if (nd && nd.parentNode)
                nd.parentNode.removeChild(nd);
        }
    }

    function popup_draw(par, x,y, name)
    {
        var itm = byid('menu_item').cloneNode(true);

        par.appendChild(itm);

        var txtbx = itm.getElementsByTagName('text')[0];
        var tspan = txtbx.getElementsByTagName('tspan')[0];
        tspan.textContent = name;

        itm.setAttribute('transform', 'matrix(1.00,0,0,1.00,'+ x +','+ y +')');
        itm.style.display='inline';

        itm.setAttribute('cursor','default');
        txtbx.style.fill = 'Silver';
        
        tspan.onmouseover = function() { txtbx.style.fill = 'White';};
        tspan.onmouseout  = function() { txtbx.style.fill = 'Silver';};

        itm.onclick = function() {
            console.log('menu choice : '+ name);
            var let = name[0];
            if (let<='9' && let>='0')
                let = '#';
            var lots = direct[let][name];
            if (lots.length==0)
                return;

            var levels = {'g':0, '1':0};
            for(var i in lots)
            {
                var lvl = info[lots[i]].lvl;
                levels[lvl]++;
            }
            if (levels[curr_level]==0)
            {
                select_level((curr_level=='g') ? '1' : 'g');      // toggle level if there are no callouts here, but callouts there
            }

            cleanup_nodes(callout_cleanups);
            callout_cleanups = [];

            for(var i in lots)
            {
                console.log('     callout lotid='+lots[i]);
                var lvl = info[lots[i]].lvl;
                if (curr_level == lvl)
                    callout_lot(lots[i]);                       // skip callouts on other levels
            }

            cleanup_nodes(popup_cleanups);
            popup_cleanups = [];
        };

        popup_cleanups.push(itm);
    }

    function trace_atts(ob)
    {
        console.log('ob['+typeof(ob)+'] ');
        for (var k in ob)
            console.log(k+'='+ob[k]);
    }

    function is_in_bbox(bbx, x, y)
    {
        var w = Math.floor(bbx.width);
        var h = Math.floor(bbx.height);
        // console.log('BBox : x='+bbx.x+' y='+bbx.y+' w='+w+' h='+h+' xmax='+(bbx.x+w)+' ymax='+(bbx.y+h));

        if (x<bbx.x || y<bbx.y)
            return false;
        if (x>(bbx.x + w) || y>(bbx.y + h))
            return false;
        return true;
    }

    function create_popup_menu(x,y,map)
    {
        // usage : create_popup(5,5, { 'item1':function() {console.log('item1 clicked'), 'item2':function(){blah()}}

        cleanup_nodes(popup_cleanups); 
        popup_cleanups = [];

        var names = [];
        for (var k in map)
            names.push(k);
        names.sort();

        var par = byid('menu_items_group');

        var dY = 21;
        y -= dY*names.length;
        for (var i in names)
        {
            //console.log('menu : '+  name );
            popup_draw(par, x,y, names[i]);
            y+=dY;
        }

        par.onmouseout=function(evt) {
            //console.log('onmouseout menu_items_group');
            var mx= evt.clientX;          //TODO CTM & M.inverse()
            var my= evt.clientY;
            //var mx= evt.screenX;
            //var my= evt.screenY;
            //console.log('mx='+mx+' my='+my);
            var pbbx = par.getBBox();
            if (is_in_bbox(pbbx, mx,my))
            {
                //console.log("in bbx");
            }
            else
            {
                //console.log("outside bbx");
                cleanup_nodes(popup_cleanups); 
                popup_cleanups = [];
            }
        }
    }

   
    function select_level(lvl)
    {
        if (lvl=='g')
        {
            svg_show('g_transports'); svg_show('g_solid'); svg_show('g_lots');
            svg_hide('l1_lots'); svg_hide('l1_solid'); svg_hide('l1_transports'); 
            svg_show('g_labels'); svg_hide('l1_labels');
        }
        else if (lvl=='1')
        {
            svg_hide('g_transports'); svg_hide('g_solid'); svg_hide('g_lots');
            svg_show('l1_lots'); svg_show('l1_solid'); svg_show('l1_transports'); 
            svg_hide('g_labels'); svg_show('l1_labels');
        }
        curr_level = lvl;

        var boxg = byid('level_nav_G').getElementsByTagName('path')[0];
        boxg.style.fill = (lvl=='g') ? 'gray' : 'silver';

        var box1 = byid('level_nav_L').getElementsByTagName('path')[0];
        box1.style.fill = (lvl=='1') ? 'gray' : 'silver';

        cleanup_nodes(callout_cleanups);
        callout_cleanups = [];

        for (var k in info)
        {
            var lotlab = byid(k+'_label');

            if (info[k].lvl == curr_level)
                show_lot_label(k);
            else
            {
                if (lotlab)
                    lotlab.parentNode.removeChild(lotlab);
            }
        }
    } 

    function box_within(out,inn)
    {
        return true;

        var bxout = out.getBBox();
        var bxinn = inn.getBBox();
        if (bxout.width<bxinn.width)
            return false;
        if (bxout.height<bxinn.height)
            return false;
        return true;                    // not strictly true.. but assumes both bboxes are con-centric
    }

    function show_lot_label(lotid)
    {
        if (!lotid || !info[lotid])
            return;
        var lot = byid(lotid);
        if (!lot || hidden_lot(lotid))
            return;

        // if exists, show it, else create it first

        function lot_name(lid)
        {
            var name = info[lid].name;
            if (name.length>10)
                name = name.split(' ')[0];
            return name.toUpperCase();
        }

        var C = svg_bbx_centre(lotid);
        var bVert=false;
        var lw=14;
        if (C.w<(lw*name.length) || C.w<40)
        {
            if (C.h>(lw*name.length) && C.h>40)
                bVert=true;
            else
                return;     // too small for label !
        }

        var lab = byid('lot_label_g').cloneNode(true);

        var par =  byid('g_labels');
        if (info[lotid].lvl != 'g') 
            par = byid('l1_labels');
        par.appendChild(lab);

        lab.getElementsByTagName('tspan')[0].textContent = lot_name(lotid);

        var S = 0.65;        //TODO //scale to fit lot bbox width
        if (!bVert)
            lab.setAttribute('transform', 'matrix('+S+',0,0,'+S+','+(C.cx-10)+','+(C.cy-3)+')')
        else
            lab.setAttribute('transform', 'matrix(0,'+(-S)+','+(S)+',0,'+(C.cx-2)+','+(C.cy+12)+')')

        lab.setAttribute('id', lotid+'_label');

        lab.onmouseover= function() { showinfo(lot);};
        lab.onmouseout = function() { hideinfo(lot);};
        lab.onclick    = function() { visit(lot);};
        lab.setAttribute('cursor','default');

        //console.log('curr_level : '+curr_level +' lid='+lotid+' lvl='+info[lotid].lvl);
        lab.style.display = 'inline';

        if (!bVert && (0.65*lab.getBBox().width > lot.getBBox().width))
            lab.style.display = 'none';
        else if (bVert && (1.1*lab.getBBox().height > lot.getBBox().height))
            lab.style.display = 'none';

        lab.getElementsByTagName('tspan')[0].setAttribute('opacity',0.75);
        lab.getElementsByTagName('tspan')[0].setAttribute('fill','DarkRed');
    }

    function init()
    {
        pop = byid('popup0');
        pop.style.display='none';

        svg_hide('menu_item');
        svg_hide('lot_label_g');

        init_directory();
        init_directory_alphabet();

        var lid = url_param('lid');
        if (lid && info[lid])
        {
            var lvl = info[lid].lvl;
            select_level(lvl);
            callout_lot(lid);
        }
        else
            select_level('g');
    }

    function mouse_move(evt)
    {
        mx=evt.clientX;           
        my=evt.clientY;               // TODO
        //mx=evt.screenX;           
        //my=evt.screenY;                 //TODO 

        if (lot_id!='')
        {
            // hovering over a lot - show popup info

            pop.setAttributeNS('','transform','translate('+ (mx-10) +','+ (my-15) +')');
        }
    }

    function showinfo(item)
    {
        item.setAttribute('fill', 'OrangeRed');

        // set summary title to json 

        lot_id = item.id;

        var inf = info[item.id];
        if (inf)
        {
            byid('pop_title').textContent  = (inf['name']) ? inf['name'] : item.id;
            byid('pop_url').textContent    = (inf['url']) ? inf['url'] : '';

            // show popup

            pop.style.display='';
        }
    }

    function hideinfo(item)
    {
        item.setAttributeNS('','fill', '#ffaa56');

        pop.style.display='none';
    } 

    function visit(item)
    {
        var u = info[item.id]['url'];
        if (!u || u=='')
            window.location = 'http://www.google.com.au/search?q=' + info[item.id]['name'];
        else
            window.location = 'http://'+u;
    }

    function svg_bbx_centre(lid)
    {
        var bbx=byid(lid).getBBox();
        var cx = Math.floor((bbx.x+bbx.x+bbx.width)/2);
        var cy = Math.floor((bbx.y+bbx.y+bbx.height)/2);
        return { "cx":cx, "cy":cy, "w":bbx.width, "h":bbx.height, 'x':bbx.x, 'y':bbx.y}; 
    }
    
    function callout_lot(lotid)
    {
        // clone the showinfo callout and leave it there 

        if (!byid(lotid) || hidden_lot(lotid))
            return;

        var inf = info[lotid];
        if (inf)    
        {
            byid('pop_title').textContent  = (inf['name']) ? inf['name'] : item.id;
            byid('pop_url').textContent    = (inf['url']) ? inf['url'] : '';
        }

        var callout=pop.cloneNode(true);
        pop.parentNode.appendChild(callout);

        var C = svg_bbx_centre(lotid);
        callout.setAttribute('transform','translate('+(C.cx-15)+','+(C.cy-15)+')');

        callout.style.display='';
        callout.onclick = function() {
            callout.parentNode.removeChild(callout);
        }

        callout_cleanups.push(callout);
    }
 
    // code to trace the svg annotations [for paths, rects]

    function trace_all_id_name(ps)
    {
        for (var i in ps) 
            if (ps[i].id) 
            {
                var nm = '';
                if (ps[i].getElementsByTagName('title') && ps[i].getElementsByTagName('title')[0])
                    nm = ps[i].getElementsByTagName('title')[0].textContent;
                console.log('{ \'id\':\''+ps[i].id + '\', \'name\':\''+ nm + '\' },' );
            }
    }

    function trace_all_paths_rects(sid)
    {
        var elt = byid(sid);
        if (!elt)
            return;
        trace_all_id_name(elt.getElementsByTagName('path'))
        trace_all_id_name(elt.getElementsByTagName('rect'))
    }
    
