class LatexController {
    constructor() {
        
    }
    UpdateView() {
        document.getElementById('LatexView').innerHTML =  "$${\\begin{align} " + tree[0].toTex() + " = " + tree[1].toTex() +  "\\end{align}}$$"

    }
            
}