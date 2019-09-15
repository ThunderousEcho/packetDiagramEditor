var colors = {
    "float": "#ff91f1", 
    "uint": "orange", 
    "int": "#ffcd38", 
    "other": "#74d474",
    "unused": "#e3e3e3",
    "reserved": "#e3e3e3"
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

    const parseResult = Papa.parse(document.getElementById("textarea").value, {comments: true});

    const table = document.getElementById("table");
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }

    var row = newRow("th", "Bit");
    for (var i = 0; i < 32; i++){
        var j = (((i / 8) >>> 0) % 2);
        var headerCell = document.createElement("th");
        headerCell.innerText = i;
        headerCell.style.background = j == 1 ? "#a0a0a0" : "lightgray";
        row.appendChild(headerCell);
    }
    table.appendChild(row);
    row = null;
   
    var columnIndex = 0;
    var rowIndex = 0;

    const data = parseResult.data;
    for (var i = 1; i < data.length; i++){

        const element = data[i];
        var size = 0;
        var color = null;
        var text = null;
        if (element.length > 0){
            size = parseInt(element[0]);
            if (element.length > 1){
                color = colors[element[1].trim()];
                if (element.length > 2){
                    text = element[2].trim();
                }
            }
        }

        if (size <= 0 || isNaN(size)){
            continue;
        }

        if (color == null){
            color = "#ff9191";
        }

        var sizeRemaining = size;

        while (true){

            if (row == null){
                row = newRow("td", ++rowIndex * 32);
            }

            const spaceRemaining = 32 - columnIndex;
            const cell = document.createElement("td");
            cell.style.background = color;
            cell.innerText = text;

            if (size != sizeRemaining){
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