//based on: http://www.williammalone.com/articles/create-html5-canvas-javascript-drawing-app/#demo-complete
context = document.getElementById('canvasD').getContext("2d");
link = document.getElementById('btnSalvar');
canvas = document.getElementById('canvasD');
var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;


function clearCanvas()
{
	
	//context.fillstyle = "white";
	//context.fillRect(0, 0, context.canvas.width, context.canvas.height);
	
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	clickX = [];
	clickY = [];
	clickDrag = [];
	
}

function limpaTela(){
  var v = document.getElementById("dynamic");
  while(v.childNodes.length > 0) {
   v.removeChild(v.lastChild);
  }
}

function convertCanvasToImage(canvas) {
				var image = new Image();
				image.src = canvas.toDataURL("image/jpeg");
				image.id = "m_imagem"
				return image;
}


function imageDataToGrayscale(imgData) {
        var grayscaleImg = [];
        for (var y = 0; y < imgData.height; y++) {
          grayscaleImg[y]=[];
          for (var x = 0; x < imgData.width; x++) {
            var offset = y * 4 * imgData.width + 4 * x;
            var alpha = imgData.data[offset+3];
            // weird: when painting with stroke, alpha == 0 means white;
            // alpha > 0 is a grayscale value; in that case I simply take the R value
            if (alpha == 0) {
              imgData.data[offset] = 255;
              imgData.data[offset+1] = 255;
              imgData.data[offset+2] = 255;
            }
            imgData.data[offset+3] = 255;
            // simply take red channel value. Not correct, but works for
            // black or white images.
            grayscaleImg[y][x] = imgData.data[y*4*imgData.width + x*4 + 0] / 255;
          }
        }
        return grayscaleImg;
}

	// given grayscale image, find bounding rectangle of digit defined
      // by above-threshold surrounding
      function getBoundingRectangle(img, threshold) {
        var rows = img.length;
        var columns = img[0].length;
        var minX=columns;
        var minY=rows;
        var maxX=-1;
        var maxY=-1;
        for (var y = 0; y < rows; y++) {
          for (var x = 0; x < columns; x++) {
            if (img[y][x] < threshold) {
              if (minX > x) minX = x;
              if (maxX < x) maxX = x;
              if (minY > y) minY = y;
              if (maxY < y) maxY = y;
            }
          }
        }
        return { minY: minY, minX: minX, maxY: maxY, maxX: maxX};
      }

// computes center of mass of digit, for centering
      // note 1 stands for black (0 white) so we have to invert.
      function centerImage(img) {
        var meanX = 0;
        var meanY = 0;
        var rows = img.length;
        var columns = img[0].length;
        var sumPixels = 0;
        for (var y = 0; y < rows; y++) {
          for (var x = 0; x < columns; x++) {
            var pixel = (1 - img[y][x]);
            sumPixels += pixel;
            meanY += y * pixel;
            meanX += x * pixel;
          }
        }
        meanX /= sumPixels;
        meanY /= sumPixels;
        
        var dY = Math.round(rows/2 - meanY);
        var dX = Math.round(columns/2 - meanX);
        return {transX: dX, transY: dY};
      }


function download_img(){
	limpaTela();

	//link.href = canvas.toDataURL("image/jpg");
	//link.download = "number.jpg";

	//var my_image = new Image();
	my_image = canvas.toDataURL("image/jpeg");
	var imgData = context.getImageData(0, 0, 280, 280);
	gray_img = imageDataToGrayscale(imgData)
	var boundingRectangle = getBoundingRectangle(gray_img, 0.01);
	var trans = centerImage(gray_img); // [dX, dY] to center of mass

	// copy image to hidden canvas, translate to center-of-mass, then
    // scale to fit into a 200x200 box (see MNIST calibration notes on
    // Yann LeCun's website)
    var canvasCopy = document.createElement("canvas");
    canvasCopy.width = imgData.width;
    canvasCopy.height = imgData.height;
    var copyCtx = canvasCopy.getContext("2d");
    var brW = boundingRectangle.maxX+1-boundingRectangle.minX;
    var brH = boundingRectangle.maxY+1-boundingRectangle.minY;
    var scaling = 190 / (brW>brH?brW:brH);

    // scale
    copyCtx.translate(canvas.width/2, canvas.height/2);
    copyCtx.scale(scaling, scaling);
    copyCtx.translate(-canvas.width/2, -canvas.height/2);
    // translate to center of mass
    copyCtx.translate(trans.transX, trans.transY);

    copyCtx.drawImage(context.canvas, 0, 0);

    // now bin image into 10x10 blocks (giving a 28x28 image)
    imgData = copyCtx.getImageData(0, 0, 280, 280);
    gray_img = imageDataToGrayscale(imgData);

    var nnInput = new Array(784);
        for (var y = 0; y < 28; y++) {
          for (var x = 0; x < 28; x++) {
            var mean = 0;
            for (var v = 0; v < 10; v++) {
              for (var h = 0; h < 10; h++) {
                mean += gray_img[y*10 + v][x*10 + h];
              }
            }
            mean = (1 - mean / 100); // average and invert
            nnInput[x*28+y] = (mean - .5) / .5;
          }
        }


//teste
context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(copyCtx.canvas, 0, 0);
          for (var y = 0; y < 28; y++) {
            for (var x = 0; x < 28; x++) {
              var block = context.getImageData(x * 10, y * 10, 10, 10);
              var newVal = 255 * (0.5 - nnInput[x*28+y]/2);
              for (var i = 0; i < 4 * 10 * 10; i+=4) {
                block.data[i] = newVal;
                block.data[i+1] = newVal;
                block.data[i+2] = newVal;
                block.data[i+3] = 255;
              }
              context.putImageData(block, x * 10, y * 10);
            }
          }



	$('#dynamic').append(gray_img);	
	$('#dynamic').append(canvasCopy);	

//('#dynamic').append('<p>'+ canvas.toDataURL("image/jpg") +'</p>')
//data:image/png;base64,
$('#dynamic').append(convertCanvasToImage(canvas));
//('<img src =data:image/jpg;base64,'+my_image+'/>')

document.getElementById("timagem").value = my_image;

/*

	var xmlHttp = new XMLHttpRequest();
    	//xmlHttp.open( "GET", "/Library/WebServer/CGI-Executables/teste.py", false); // false for synchronous request
    	xmlHttp.open( "GET", location.href+"cgi/predict.py", false); // false for synchronous request
    	xmlHttp.send( null );
//	$('#dynamic').append('<p>Predict = '+ xmlHttp.responseText +'</p>');

*/

/*
codigo pode ser desnecessario
	$('#btnSalvar').click(function (event) {
  event.preventDefault();
  // or use return false;
	});*/
}

function addClick(x, y, dragging)
{
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
}

function redraw(){
  context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
  
  context.strokeStyle = "#df4b26";
  context.lineJoin = "round";
  context.lineWidth = 5;
			
  for(var i=0; i < clickX.length; i++) {		
    context.beginPath();
    if(clickDrag[i] && i){
      context.moveTo(clickX[i-1], clickY[i-1]);
     }else{
       context.moveTo(clickX[i]-1, clickY[i]);
     }
     context.lineTo(clickX[i], clickY[i]);
     context.stroke();
    // context.closePath();
  }
}


//$('#btnLimpar').onclick = alert("nop");

window.onload = function() {
//	context = document.getElementById('canvasD').getContext("2d");
//	debbuger;


$('#canvasD').mousedown(function(e){
  var mouseX = e.pageX - this.offsetLeft;
  var mouseY = e.pageY - this.offsetTop;
		
  paint = true;
  addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
  redraw();
});

$('#canvasD').mousemove(function(e){
  if(paint){
    addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
    redraw();
  }
});


$('#canvasD').mouseup(function(e){
  paint = false;
});


$('#canvasD').mouseleave(function(e){
  paint = false;
});
};