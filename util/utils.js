/* Utilities */

module.exports = {
    /**
     * XORs elements of two arrays
     * @param {Array} A 
     * @param {Array} B 
     */
    XORArrays: function(A, B) {
        let out = []
        for (let index = 0; index < A.length; index++) {
            out.push(A[index] ^ B[index]);
        }
        return out
    },

    /**
     * Permutates array elements
     * @param {Array} input 
     */
    permutate: function(input) {
        let out = input
        var i = 0
        while (i < input.length) {
            let target = (input[i] + i) % input.length 
            let temp = out[target]
            out[target] = input[i]
            input[i] = temp
            i++
        }
        return out
    }
}