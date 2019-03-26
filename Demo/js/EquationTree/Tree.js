function Tree() {
    this.root = Node()
    this.isLeft = true
    // written in a cheating way, only works with equations of at
    // most (a * b) + c = (e * f) + d
    this.extend = function (token) {
        temp = this.root
        this.root = Node();
        if (this.isLeft) {
            this.root.value = token
            this.root.left = temp
            this.isLeft = false
        }
        else {
            this.root.right = Node()
            this.root.right.value = token
            this.isLeft = true
        }
    }

    this.GetEquation = function() {
        var equation = ""
        this.getEquation(this.root, equation)
        return equation
    }
    this.getEquation = function(node, e) {
        if (node.value != null) {
            this.getEquation(node.left, e)
            e += node.value
            this.getEquation(node.right, e)
        }
    }
}
function Node() {
    this.value = null
    this.right = null
    this.left = null
}