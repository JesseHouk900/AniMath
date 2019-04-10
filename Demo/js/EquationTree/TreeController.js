class TreeController{
    constructor(lhs, rhs){
        require.config({
            paths: {
                mathjs: 'js/includes/mathjs/dist/math',
                _make_tree: 'js/EquationTree/_make_tree'
            }
        })
        this.tree = null
        // require(["mathjs"], function(math) {
        //     console.log(math.eval('sqrt(-25)'))
            
        // })

        this.tree = require(["mathjs", "_make_tree"], function(math, mt) {
            var tree = mt.pieceTogether(lhs, rhs)

            document.getElementById('LatexView').innerHTML =  "\\begin{align} " + tree[0].toTex() + " = " + tree[1].toTex() +  "\\end{align}"
            console.log(document.getElementById('LatexView').innerHTML)
        })
        
        //const math = require('mathjs')
    }

    NewTree (LHS, RHS) {
        
        require(this.tree, ["mathjs"], function(math) {
            var left = 4
            var right = 5
            
            //console.log(left)
            //console.log(right)
            left = math.parse(LHS)
            right = math.parse(RHS)
            //console.log(new math.expression.node.OperatorNode('=', 'equals', [left, right]))
            return new math.expression.node.OperatorNode('=', 'equals', [left, right])
        })
        setTimeout(console.log(this.tree), 8000)
        
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