// Node
var Node = function(id, text) {
    this.id = id;
    this.text = text;
    this.x = 0;
    this.y = 0;
    this.subNodes = [];
}

Node.prototype.place = function() {
    var node = document.createElement('div');
    node.setAttribute('class', 'node');
    node.setAttribute('id', this.id);
    node.innerHTML = '<a href="/node/' + this.id + '" id="' + this.id + '">' + this.text + '</a>';
    var nodesDiv = document.getElementById("nodesDiv");
    nodesDiv.appendChild(node);

    var width = $('div#' + this.id).width();
    var height = $('div#' + this.id).height();
    node.setAttribute('style', 'left:' + (this.x - (width / 2)) + 'px; top:' + (this.y - (height / 2)) + 'px;');
}

// Link
var Link = function(orig, targ, type) {
    this.orig = orig;
    this.targ = targ;
    this.type = type;
}

Link.prototype.draw = function(context) {
    var x0 = this.orig.x;
    var x1 = this.targ.x;
    var y0 = this.orig.y;
    var y1 = this.targ.y;

    var cx = x0 + ((x1 - x0) / 2)
    var cy = y0 + ((y1 - y0) / 2)

    var slope = (y1 - y0) / (x1 - x0);
    var angle = Math.atan(slope);

    var color = '#5F5';

    if (this.type == 'likes')
        color = '#F55';
    else if (this.type == 'is')
        color = '#F00';
    else if (this.type == '?')
        color = '#FFF';

    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = 0.7;
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();

    context.font = "12pt Sans-Serif";
    var dim = context.measureText(this.type);
    var width = dim.width + 6;
    var height = 18;
    context.save();
    context.translate(cx, cy);
    context.rotate(angle);

    context.beginPath();
    if ((x0 < x1) || ((x0 == x1) && (y0 < y1))) {
        context.moveTo(-(width / 2), -(height / 2));
        context.lineTo(-(width / 2), (height / 2));
        context.lineTo((width / 2), (height / 2));
        context.lineTo((width / 2) + 6, 0);
        context.lineTo((width / 2), -(height / 2));
    }
    else {
        context.moveTo(-(width / 2), -(height / 2));
        context.lineTo(-(width / 2) - 6, 0);
        context.lineTo(-(width / 2), (height / 2));
        context.lineTo((width / 2), (height / 2));
        context.lineTo((width / 2), -(height / 2));
    }
    context.closePath();
    context.fill();

    context.fillStyle = '#FFF';
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(this.type, 0, 0);
    context.restore();
}

// Graph
var Graph = function(context) {
    this.context = context;
    this.nodes = {};
    this.links = [];
    this.newNode = false;
    this.newNodeActive = false;
}

Graph.prototype.drawLinks = function() {
    var i;
    for (i = 0; i < this.links.length; i++) {
        this.links[i].draw(this.context);
    }

    if (this.newLink) {
        this.newLink.draw(this.context);
    }
}

Graph.prototype.placeNodes = function() {
    for (var key in g.nodes) {
        if (g.nodes.hasOwnProperty(key)) {
            g.nodes[key].place();
        }
    }
}

Graph.prototype.layout = function(node, depth, cx, cy, px, py, ang0, ang1) {
    node.x = px + ((Math.random() * 50) - 25);
    node.y = py + ((Math.random() * 50) - 25);

    var count = node.subNodes.length;
    var ang = ang0;
    var rad = depth * 150;

    var deltaAng = 0;
    if (count == 1) {
        ang += (ang1 - ang0) / 2;
    }
    else if (count > 1) {
        if (depth == 1) {
            deltaAng = (ang1 - ang0) / count;
        }
        else {
            deltaAng = (ang1 - ang0) / (count - 1);
        }
    }

    var i;
    for (i = 0; i < count; i++) {
        var npx = cx + (Math.sin(ang) * rad);
        var npy = cy + (Math.cos(ang) * rad);
        this.layout(node.subNodes[i], depth + 1, cx, cy, npx, npy, ang - (deltaAng / 2), ang + (deltaAng / 2));
        ang += deltaAng;
    }
}

// Entry point functions & global variables
var g;

var initGraph = function(nodes, links) {
    var elem = document.getElementById('graphCanvas');
    var context = elem.getContext('2d');

    g = new Graph(context);

    context.translate(0.5, 0.5)

    var i;
    for (i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var id = n['id'];
        var text = n['text'];
        var node = new Node(id, text);
        g.nodes[id] = node;
    }   

    // Assign root, parents and subNodes
    for (i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var id = n['id'];
        var parentID = n['parent'];
        if (parentID == '') {
            g.root = g.nodes[id];
            g.nodes[id].parent = false;
        }
        else {
            g.nodes[id].parent = g.nodes[parentID];
            g.nodes[parentID].subNodes[g.nodes[parentID].subNodes.length] = g.nodes[id];
        }
    }

    for (i = 0; i < links.length; i++) {
        var l = links[i];
        var link = new Link(g.nodes[l['orig']], g.nodes[l['targ']], l['type']);
        g.links.push(link);
    }
    
    var halfWidth = window.innerWidth / 2;
    var halfHeight = window.innerHeight / 2;

    g.layout(g.root, 1, halfWidth, halfHeight, halfWidth, halfHeight, 0, Math.PI * 2);

    context.canvas.width  = window.innerWidth;
    context.canvas.height = window.innerHeight;

    g.drawLinks();
    g.placeNodes();
}
