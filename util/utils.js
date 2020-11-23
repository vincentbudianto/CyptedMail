/* Utilities */
let randomBig = require('crypto')
let bigIntFormat = require('biguint-format')

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

    generateBigPrime: function( bitCount ) {
        let notUsedDH = randomBig.createDiffieHellman(bitCount)
        let prime = notUsedDH.getPrime('hex')
        
        let primeNum = BigInt('0x' + prime)

        return primeNum
    },

    isPrime: function( x ) {
        let tested = Math.floor(Math.sqrt(x))
        for(var i = 2; i < tested; i++) {
            if(tested % i === 0) return false
        }
        return tested > 1
    },

    sqrtBig: function ( value ) {
        if (value < 0n) {
            throw 'square root of negative numbers is not supported'
        }
    
        if (value < 2n) {
            return value;
        }
    
        function newtonIteration(n, x0) {
            const x1 = ((n / x0) + x0) >> 1n;
            if (x0 === x1 || x0 === (x1 - 1n)) {
                return x0;
            }
            return newtonIteration(n, x1);
        }
    
        return newtonIteration(value, 1n);
    },

    isPrimeBig: function( x ) {
        let tested = this.sqrtBig(x)
        // console.log("Tested", tested)
        for(let i = 2n; i < (tested + 1n); i++) {
            if(x % i === 0n) return false
        }
        return tested > 1n
    },

    dec2binCount: function(dec) {
        let strDec = dec.toString(2);
        return BigInt(strDec.length);
    },

    getRandomInt: function(bitCount) {
        let seed = bigIntFormat(randomBig.randomBytes(Math.floor(Number(bitCount / 8n))), 'dec')
        return BigInt(seed);
    },

    getRandomIntRange: function(bitCount, minNumber, maxNumber) {
        let byteCount = bitCount / 8n
        if (bitCount % 8n > 0) {
            byteCount++
        }
        let seed = bigIntFormat(randomBig.randomBytes(Math.floor(Number(byteCount))), 'dec')
        seed = BigInt(seed)
        while (seed > maxNumber || seed < minNumber) {
            seed = bigIntFormat(randomBig.randomBytes(Math.floor(Number(byteCount))), 'dec')
            seed = BigInt(seed)
        }
        return BigInt(seed);
    },

    getMinIntByBitCount: function(bitCount) {
        return 2n ** (bitCount - 1n);
    },
    
    /**
     * Mod operator (eg: mod(-10, 26) = 16)
     * @param {Number} a
     * @param {Number} b
     * @returns {Number}
     */
    mod: function(a, b) {
        if (a < 0n) {
            let multiplier = a / b
            a = a + -1n * (multiplier - 1n) * b
        }
        let res = a % b;
        return res >= 0 ? res : this.mod(a + b, b);
    },

    /**
     * Modular inverse (eg: modinv(7, 26) = 15)
	 * @param {Number} m
	 * @param {Number} n
	 * @returns {Number}
	 */
    modInverse: function (m, n) {
        // Find gcd
        const s = [];
        let b = n;

        if (m < 0n) {
            let multiplier = m/n
            m = m + -1n * (multiplier - 1n) * n 
        }

        while (b) {
            [m, b] = [b, m % b];
            s.push({ m, b });
        }

        // Find inverse
        if (m !== 1n) {
            return NaN;
        } else {
            let x = 1n;
            let y = 0n;

            for (let i = s.length - 2; i >= 0; --i) {
                [x, y] = [y, x - y * (s[i].m / s[i].b)];
            }

            return (y % n + n) % n;
        }
    },
    
    strToHex: function(initStr) {
        let arr = [];
        for (let i = 0; i < initStr.length; i++) {
            arr[i] = (initStr.charCodeAt(i).toString(16)).slice(-4);
        }
        return "0x" + arr.join('');
    }
}