const colors = {
    "uint": "orange", 
    "int": "#ffcd38", 
    "float": "#ff91f1", 
    "unused": "#e3e3e3",
    "reserved": "#e3e3e3",
    "string" : "#4df7ef",
    "bool" : "#f74d75",
    "other": "#74d474"
};
var columnCount = 32;

function newRow(type, text){
    row = document.createElement("tr");
    var leftmost = document.createElement(type);
    leftmost.style.background = "lightgray";
    leftmost.className = "leftmost";
    leftmost.innerText = text;
    leftmost.style.fontWeight = "bold";
    row.appendChild(leftmost);
    return row;
}

var moving = false;

function g(event){
    console.log(moving);
    if(moving){
        var x = event.clientX / window.innerWidth * 100;
        document.getElementById("textarea").style.width = (99-x) + "%";
        document.getElementById("resizer").style.right = (99-x) + "%";
        document.getElementById("left").style.width = x + "%";
        console.log(x);
    }
}

function start(){
    const params = new URLSearchParams(document.location.search);
    const diagram = params.get("diagram");
    if (diagram != null){
        document.getElementById("textarea").value = diagram;
    }
    updatePreview();
}

function screenshot(){
    html2canvas(document.getElementById("table"), {scale:2}).then(canvas => {
        const link = document.createElement("a");
        link.download = "Packet Diagram.png";
        link.href = canvas.toDataURL();
        link.click();
    });
}

function openFile(){
    document.getElementById("fileInput").click();
}

function onFileSelected(){

    const fileInput = document.getElementById("fileInput");
    if (fileInput.files.length == 0)
        return;

    var reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById("textarea").value = e.target.result;
        updatePreview();
    };
    reader.onerror = function(e) {
        console.error(e);
    };
    reader.readAsText(fileInput.files[0]);
}

function save(){
    var text = document.getElementById("textarea").value;
    var file = new Blob([text], {type: "text/plain"});
    var a = document.createElement("a"),
    url = URL.createObjectURL(file);
    a.href = url;
    a.download = "Packet Diagram.txt";
    a.click();
}

function updatePreview(){

    const table = document.getElementById("table");
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }

    const parseResult = parse(document.getElementById("textarea").value);

    var unitIsBytes = true;
    for (var i = 0; i < parseResult.length; i++) {
        if (parseResult[i].sizeBits % 8 != 0){
            unitIsBytes = false;
            break;
        }
    }

    var gr;
    var unit;
    if (unitIsBytes){
        gr = 4;
        unit = "Byte";
    } else {
        gr = 8;
        unit = "Bit";
    }

    var row = newRow("th", unit);
    for (var i = 0; i < columnCount; i++){
        var j = (((i / gr) >>> 0) % 2);
        var headerCell = document.createElement("th");
        headerCell.innerText = i;
        headerCell.style.background = j == 1 ? "#a0a0a0" : "lightgray";
        row.appendChild(headerCell);
    }
    table.appendChild(row);
    row = null;
   
    var columnIndex = 0;
    var rowIndex = 0;

    for (var i = 0; i < parseResult.length; i++) {

        var part = parseResult[i];

        var color = "#ff9191";
        if (typeof part.type !== 'undefined'){
            color = colors[part.type];
        }

        var size = unitIsBytes ? (part.sizeBits / 8) : part.sizeBits;
        var sizeRemaining = size;

        while (true){

            if (row == null){
                row = newRow("td", rowIndex++ * columnCount);
            }

            const spaceRemaining = columnCount - columnIndex;
            const cell = document.createElement("td");
            cell.style.background = color;

            if (sizeRemaining != size){
                var leftCont = document.createElement("div");
                leftCont.className = "leftCont";
                cell.append(leftCont);
            } else{
                cell.style.paddingLeft = "0.25em";
            }

            const textSpan = document.createTextNode(part.name);
            //const textSpan = document.createElement("div");
            //textSpan.innerText = part.name;
            //textSpan.className = "textSpan";
            cell.append(textSpan);

            if (spaceRemaining == sizeRemaining){
                cell.colSpan = sizeRemaining;
                cell.style.paddingRight = "0.25em";
                row.appendChild(cell);
                table.appendChild(row);
                row = null;
                columnIndex = 0;
                break;
            } else if (spaceRemaining > sizeRemaining){
                cell.colSpan = sizeRemaining;
                cell.style.paddingRight = "0.25em";
                row.appendChild(cell);
                columnIndex += sizeRemaining;
                break;
            } else {
                cell.colSpan = spaceRemaining;
                var rightCont = document.createElement("div");
                rightCont.className = "rightCont";
                cell.insertBefore(rightCont, cell.firstChild);
                sizeRemaining -= spaceRemaining;
                row.appendChild(cell);
                table.appendChild(row);
                row = null;
                columnIndex = 0;
            }
        }
    }

    if (row != null){
        table.appendChild(row);
    }
}