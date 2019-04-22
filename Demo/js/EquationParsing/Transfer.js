class TransferController {

    constructor() {

        // Will take the model and return colored 
        // text for terms avaliable for transfer
        // SUGGESTION: group terms that can be 
        // transfered with colored parenthesis
        this.colors = ["#ff0000", "#ff4000", "#ff8000", "#ffbf00",
        "#ffff00", "#bfff00", "#80ff00", "#40ff00", "#00ff00",
        "#00ff40", "#00ff80", "#00ffbf", "#00ffff", "#00bfff",
        "#0080ff", "#0040ff", "#0000ff", "#4000ff", "#4000ff",
        "#8000ff", "#bf00ff", "#ff00ff", "#ff00bf", "#ff0080",
        "#ff0040"]
        this.ColorIndex = 0
        this.equation = ""
        this.value
    }

    Transfer(tree) {
        ColorIndex = 0        
        //console.log(tree)
        var left = transfer(tree[0], "", ColorIndex)
        var right = transfer(tree[1], "", ColorIndex)
        document.getElementById("OperatorOutput").innerHTML = left + " = " + right
        var term = prompt("Please enter the term that should be moved: " + left + " = " + right , "2 * x")
        
        
        
        
    }
    
    transfer(node, tE, colorIndex) {
        if (node) {
            var value
            require(['mathjs'], function(math) {
                switch(node.type) {
                    case math.OperatorNode:
                    value = node.op
                    break;
                    case math.ConstantNode:
                    value = node.value
                    break;
                    case math.VariableNode:
                    value = node.name
                    break;
                }
                window.transferController.value = value
                console.log(value)
            })
            
            if (colorIndex > ColorIndex) {
                ColorIndex = colorIndex
            }
            tE += "(".fontcolor(colors[colorIndex])
            tE = transfer(node.left, tE, colorIndex + 1) 
            tE += this.value
            tE = transfer(node.right, tE, colorIndex + 2)
            tE += ")".fontcolor(colors[colorIndex])
            
            return tE
            
        } 
        
    }
    
    HandleTransfer(term) {
        
    }
}