// Will return the model of the equation
function NewTree(LHS, RHS) {
    var pieces = MakeTree(LHS, RHS)
    var tree = new Tree()
    alert(tree)
    tree.root.value = '='
    tree.root.left = pieces[0].root
    tree.root.right = pieces[1].root
    return tree
}
