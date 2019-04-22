// NOT IN USE SINCE MATHJS
class Tree {
    // written in a cheating way, only works with equations of at
    // most (a * b) + c = (e * f) + d
    constructor() {
        this.root = new Node();
        this.isLeft = true
        this.operators = ['+', '-', '*', '/']
        this.finalEquation = []
    }
    // problem child
    extend(token, pos) {
        //console.log(token)
        if (pos == "l") {
            var temp = this.root
            this.root = new Node();
            temp.value = token
            this.root.left = temp
        }
        else if (pos == "r"){
            this.root.right = new Node()
            this.root.right.value = token
        }
        else if (pos == "p") {
            this.root.value = token
        }
    }

    GetEquation() {
        var equation = {Name: ""}
        //console.log(this.root)
        this.getEquation(this.root, equation)
        return equation
    }
    getEquation(node, e) {
        //console.log(e)
        if (node && node.value != null) {
            this.getEquation(node.left, e)
            e.Name += node.value
            this.getEquation(node.right, e)
        }
    }

        // Will take the two sides of the equation 
    // and return an array of the terms and 
    // operations in the order they should be 
    // inserted (subjective)

    MakeTree(LHS, RHS) {
        //console.log(LHS.value)
        //console.log(RHS.value)
        
        this.finalEquation = []
        return [this.ParseSide(LHS), this.ParseSide(RHS)]
        
    }

    ParseSide(expression) {
        tree = new Tree()
        
        //console.log(expression)
        // split string into individual characters
        var splitEX = expression.split("")
        // n = number, x = variable, o = operation
        var currentTerm = 'n'
        var procToken = ""
        for(var i = 0; i < splitEX.length; i++) {
            //console.log(splitEX[i])
            //setTimeout(console.log(tree), 5000)
            //console.log(splitEX[i])
            // if there is a number to process 
            if (!isNaN(splitEX[i])) {
                //console.log("Not not a Number (a number)")
                // if the previous token processed was not a number...
                if (currentTerm != 'n') {
                    if (this.isLeft) {
                        // make a new value
                        tree.extend(procToken, "l")
                    }
                    else {
                        tree.extend(procToken, "r")
                    }
                        procToken = "0"
                        currentTerm = 'n'
                }
                // use horners rule
                procToken = (parseInt(procToken, 10) * 10) + parseInt(splitEX[i], 10)

            }
            else {
                // if token is an operation
                if (this.operators.includes(splitEX[i])) {
                    //console.log("is operation")
                    if (currentTerm != 'o') {   
                        if (this.isLeft) {
                            // make a new value
                            tree.extend(procToken, "l")
                        }
                        else {
                            tree.extend(procToken, "r")
                        }
                            procToken = ""
                            currentTerm = 'o'
                    }
                    procToken += splitEX[i]
                }
                // the token is a variable
                else {
                    //console.log("is variable")
                    if (currentTerm != 'x') {
                        if (this.isLeft) {
                            // make a new value
                            tree.extend(procToken, "l")
                        }
                        else {
                            tree.extend(procToken, "r")
                        }
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
}
class Node {
    constructor() {

        this.value = null
        this.right = null
        this.left = null
    }
}