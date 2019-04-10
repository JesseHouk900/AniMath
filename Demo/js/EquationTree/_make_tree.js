define (['mathjs'], function(math) {
    return { pieceTogether: function(lhs, rhs)
        { 
            return [ math.parse(lhs), math.parse(rhs)]
        }
    }
})