class LatexController {
    constructor() {
        
    }
    static UpdateView() {
        require(["mathjs", "_make_tree"], function(math, mt) {
            var tree = mt.pieceTogether(lhs.value, rhs.value)

            //document.getElementById('LatexView').innerHTML =  "$${\\begin{align} " + tree[0].toTex() + " = " + tree[1].toTex() +  "\\end{align}}$$"
            document.getElementById('LatexView').innerHTML =  "$${\\begin{align} " + tree[0].toTex() + " = " + tree[1].toTex() +  "\\end{align}}$$"
            //console.log(document.getElementById('LatexView').innerHTML)
            window.treeController.tree = tree
            //console.log(treeController.tree)
        })

    }
            
}