function ParseSide(expression) {
    var tree = Tree()
    // split string into individual characters
    var splitEX = expression.split("")
    parse_side(expression, splitEX, splitEX)
}
function parse_side(expression) {
    // n = number, x = variable, o = operation
    var currentTerm = 'n'
    var procToken = ""
    for(var i = 0; i < splitEX.length; i++) {
        // if there is a number to process 
        if (!isNaN(splitEX[i])) {
            if (currentTerm != 'n') {
                tree.extend(procToken)
                procToken = "0"
                currentTerm = 'n'
            }
            procToken = (parseInt(procToken, 10) * 10) + parseInt(splitEX[i], 10)

        }
        else {
            // if token is an operation
            if (operators.includes(splitEX[i])) {
                if (currentTerm != 'o') {
                    tree.extend(procToken)
                    procToken = ""
                    currentTerm = 'o'
                }
                procToken += splitEX[i]
            }
            // the token is a variable
            else {
                if (currentTerm != 'x') {
                    tree.extend(procToken)
                    procToken = ""
                    currentTerm = 'x'
                }
                // if the token is a single letter
                if (/^[a-zA-Z]$/.test(splitEX[i])) {
                    procToken += splitEX[i]

                }
            }
        }
    }
    return tree
}