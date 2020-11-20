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
    },

    /**
     * 
     * @param {Number} base 
     * @param {Number} exp 
     * @param {Number} mod 
     */
    expmod: function( base, exp, mod ){
        if (exp == 0) return 1;
        if (exp % 2 == 0){
            return Math.pow( expmod( base, (exp / 2), mod), 2) % mod;
        }
        else {
            return (base * expmod( base, (exp - 1), mod)) % mod;
        }
    },

    isPrime: function( x ) {
        let tested = Math.floor(Math.sqrt(x))
        for(var i = 2; i < tested; i++) {
            if(tested % i === 0) return false
        }
        return tested > 1
    },

    dec2bin: function(dec) {
        return (dec >>> 0).toString(2);
    },

    getRandomInt: function(min, max) {
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    getMinIntByBitCount: function(bitCount) {
        return Math.pow(2, bitCount - 1);
    }
}