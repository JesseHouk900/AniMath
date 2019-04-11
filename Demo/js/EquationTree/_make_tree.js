define (['mathjs'], function(math) {
    return { pieceTogether: function(lhs, rhs)
        { 
            //console.log(lhs)
            //console.log(rhs)
            return [ math.parse(lhs), math.parse(rhs)]
        }
    }
})