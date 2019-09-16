var colors = {
    "uint": "orange", 
    "int": "#ffcd38", 
    "float": "#ff91f1", 
    "unused": "#e3e3e3",
    "reserved": "#e3e3e3",
    "string" : "#4df7ef",
    "other": "#74d474"
};

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

function start(){
    const params = new URLSearchParams(document.location.search);
    const diagram = params.get("diagram");
    if (diagram != null){
        document.getElementById("textarea").value = diagram;
    }
    updatePreview();
}

function updatePreview(){

    const table = document.getElementById("table");
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }

    const parseResult = parse(document.getElementById("textarea").value);
    console.log(parseResult);

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
    for (var i = 0; i < 32; i++){
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
                row = newRow("td", rowIndex++ * 32);
            }

            const spaceRemaining = 32 - columnIndex;
            const cell = document.createElement("td");
            cell.style.background = color;
            cell.innerText = part.name;

            if (sizeRemaining != size){
                cell.style.borderLeft = "0.25em solid rgba(0,0,0, 0.15)";
            }

            if (spaceRemaining == sizeRemaining){
                cell.colSpan = sizeRemaining;
                row.appendChild(cell);
                table.appendChild(row);
                row = null;
                columnIndex = 0;
                break;
            } else if (spaceRemaining > sizeRemaining){
                cell.colSpan = sizeRemaining;
                row.appendChild(cell);
                columnIndex += sizeRemaining;
                break;
            } else {
                cell.colSpan = spaceRemaining;
                cell.style.borderRight = "0.25em solid rgba(0,0,0, 0.15)";
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