var types = [
    "uint", "int", "float", "unused", "reserved", "string", "other"
];

function parse(str){

    var ret = [];
    var lines = str.split("\n");

    for(var i = 0; i < lines.length; i++){
        var line = lines[i];
        var part = {keywords: []};

        var indexOfSemiColon = line.indexOf(';');
        if (indexOfSemiColon == 0){
            continue;
        } else if (indexOfSemiColon != -1){
            part.description = line.substring(indexOfSemiColon + 1).trim();
            line = line.substring(0, indexOfSemiColon);
        }

        var keyword = "";
        var j = 0;
        var reachedType = false;
        for (; j < line.length; j++){
            var character = line[j];
            if (character.trim() == ''){
                reachedType = parseKeyword(keyword, part);
                keyword = "";
                if (reachedType) {
                    break;
                }
            } else {
                keyword += character;
            }
        }

        if (typeof part.sizeBits !== 'undefined'){
            part.name = line.substring(j + 1).trim();
            ret.push(part);
        }
    }

    return ret;
}

function parseKeyword(keyword, part){

    if (types.includes(keyword)){
        part.type = keyword;
        return true;
    } else if (keyword.endsWith("-bit")){
        var sizeBits = parseInt(keyword.substring(0, keyword.length - 4));
        if (!isNaN(sizeBits)){
            part.sizeBits = sizeBits;
            return false;
        }
    } else if (keyword.endsWith("-byte")){
        var sizeBytes = parseInt(keyword.substring(0, keyword.length - 5));
        if (!isNaN(sizeBytes)){
            part.sizeBits = sizeBytes * 8;
            return false;
        }
    }
    part.keywords.push(keyword);
    return false;
}