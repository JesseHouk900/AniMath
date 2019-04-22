// Will take the model and return colored 
// text for terms avaliable for transfer
// SUGGESTION: group terms that can be 
// transfered with colored parenthesis
var colors = ["#ff0000", "#ff4000", "#ff8000", "#ffbf00",
    "#ffff00", "#bfff00", "#80ff00", "#40ff00", "#00ff00",
    "#00ff40", "#00ff80", "#00ffbf", "#00ffff", "#00bfff",
    "#0080ff", "#0040ff", "#0000ff", "#4000ff", "#4000ff",
    "#8000ff", "#bf00ff", "#ff00ff", "#ff00bf", "#ff0080",
    "#ff0040"]
var ColorIndex = 0
function Transfer(tree) {
    ColorIndex = 0        
    console.log(tree)
    var left = transfer(tree[0], "", ColorIndex)
    var right = transfer(tree[1], "", ColorIndex)
    document.getElementById("OperatorOutput").innerHTML = left + " = " + right
    var term = prompt("Please enter the term that should be moved: " + left + " = " + right , "2 * x")
    
    
    

}

function transfer(node, tE, colorIndex) {
    if (node) {
        console.log(tE)
        var value
        if (node.op) {
            value = node.op
        }
        else if (node.value) {
            value = node.value
        }
        else if (node.name) {
            value = node.name
        }
        if (colorIndex > ColorIndex) {
            ColorIndex = colorIndex
        }
        tE += "(".fontcolor(colors[colorIndex])
        tE = transfer(node.left, tE, colorIndex + 1) 
        tE += node.value
        tE = transfer(node.right, tE, colorIndex + 2)
        tE += ")".fontcolor(colors[colorIndex])
        
        return tE

    } 

}

function HandleTransfer(term) {

}