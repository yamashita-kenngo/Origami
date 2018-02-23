
var project = new OrigamiPaper("canvas-face-matrix");
// project.setPadding(0.05);

var red = {hue:0.04*360, saturation:0.87, brightness:0.90 };
var blue = {hue:0.53*360, saturation:0.82, brightness:0.28 };

project.style.valley.strokeColor = blue;
project.style.mountain.strokeColor = blue;
project.faceLayer.visible = false;
project.treeLineLayer = new project.scope.Layer();

project.reset = function(){
	this.load("../files/svg/crane.svg", function(){
		project.cp.generateFaces();
		project.makeFacePathLines();
	});
}
project.reset();

project.makeFacePathLines = function(startingFace){
	if(startingFace === undefined){
		var bounds = project.cp.bounds();
		startingFace = project.cp.getNearestFace(bounds.size.width * 0.5, bounds.size.height*0.5);
	}
	if(startingFace === undefined){ return; }
	var tree = project.cp.adjacentFaceTree(startingFace);
	// console.log(tree);
	project.draw();
	project.treeLineLayer.activate();
	project.treeLineLayer.removeChildren();
	for(var i = 0; i < tree.faces.length; i++){
		parents = tree.faces[i].parents
		if(parents.length > 0){
			var thisFace = tree.faces[i].face;
			var c1 = new XY(0,0);
			var c2 = new XY(0,0);
			for(var j = 0; j < thisFace.nodes.length; j++){
				c1.x += thisFace.nodes[j].x;
				c1.y += thisFace.nodes[j].y;
			}
			for(var j = 0; j < parents[0].nodes.length; j++){
				c2.x += parents[0].nodes[j].x;
				c2.y += parents[0].nodes[j].y;
			}
			c1.x /= thisFace.nodes.length;
			c1.y /= thisFace.nodes.length;
			c2.x /= parents[0].nodes.length;
			c2.y /= parents[0].nodes.length;
			var path = new paper.Path({segments: [c1,c2], closed: false, strokeWidth:0.01, strokeColor:red });
		}
	}
}

project.onFrame = function(event) { }
project.onResize = function(event) { }
project.onMouseDown = function(event){ }
project.onMouseUp = function(event){ }
project.onMouseMove = function(event) {
	if(event === undefined) return;
	var startingFace = project.cp.getNearestFace(event.point.x, event.point.y);
	if(startingFace !== undefined){
		this.makeFacePathLines(startingFace);
	}
}
