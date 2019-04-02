// Will return the model of the equation
function NewTree(LHS, RHS) {
    tree = new Tree()
    pieces = tree.MakeTree(LHS, RHS)
    // pieces.forEach(function(i) {
    //     console.log(i)
    // })
    tree.root.value = '='
    tree.root.left = this.pieces[0].root.left
    tree.root.right = this.pieces[1].root
    return tree
}
