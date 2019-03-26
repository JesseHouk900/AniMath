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

function Transfer(model) {
    var equation = transfer(model.root, "", 0)
    var term = prompt("Please enter the term that should be moved: " + equation, "2 * x")
    var termTree = ParseSide(term)
    

}

function transfer(node, tE, colorIndex) {
    if (node.value != null) {
        tE += "(".fontcolor(colors[colorIndex])
        tE = transfer(node.left, tE, colorIndex + 1) 
        tE += node.value
        tE = transfer(node.right, tE, colorIndex + 2)
        tE += ")".fontcolor(colors[colorIndex])
    }
    return tE
}

function HandleTransfer(term) {

}