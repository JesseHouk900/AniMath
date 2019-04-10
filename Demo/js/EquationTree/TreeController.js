class TreeController{
    constructor(){
        // nothing yet, tree is made when button is clicked
        require.config({
            paths: {
                mathjs: 'js/includes/mathjs/dist/math'
            }
        })
        require(["mathjs"], function(math) {
            console.log(math.eval('sqrt(-25)'))

        })
        
        //const math = require('mathjs')
    }

    NewTree (LHS, RHS) {
        var left = null
        var right = null
        require(["mathjs"], function(math, left, right) {
            left = math.parse(LHS)
            right = math.parse(RHS)
            console.log(left)
            console.log(right)
        })
        
    }
    // // Will return the model of the equation
    // NewTree(LHS, RHS) {
    //     tree = new Tree()
    //     pieces = tree.MakeTree(LHS, RHS)
    //     pieces.forEach(function(i) {
    //         console.log(i)
    //     })
    //     tree.root.value = '='
    //     tree.root.left = this.pieces[0].root.left
    //     tree.root.right = this.pieces[1].root
    //     return tree
    // }
    // // Will take the two sides of the equation 
    // // and return an array of the terms and 
    // // operations in the order they should be 
    // // inserted (subjective)

    // MakeTree(LHS, RHS) {
    //     var operators = ['+', '-', '*', '/']
    //     var finalEquation = []
    //     return [ParseSide(LHS.value), ParseSide(RHS.value)]
        
    // }
}