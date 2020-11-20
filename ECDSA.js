/* ECDSA Cryptography */
/* All elements of array must be in value 0-255 */
/**
 * Requirements:
 * ECMAScript 2015 
 */ 

let string = require('./util/string')
let utils = require('./util/utils')
let keccak = require('./Keccak')
let ec = require('./EllipticCurve')

module.exports = {
    ECDSA: class {
        constructor(a, b, p, basePointNum) {
            this.curve = new ec.EllipticCurve(a, b, p)
            this.curve.setBasePointNumber(basePointNum)
        }

        setPrivateKey(privateKey) {
            this.privateKey = privateKey
        }

        setPrivateKeyRandom() {
            let min = utils.getMinIntByBitCount(this.curve.binSize - 1)
            let max = this.curve.n - 1
            this.privateKey = utils.getRandomInt(min, max)
            this.setPublicKey()
        }

        setPublicKey() {
            this.publicKey = this.curve.multiplyGraphPoint(this.curve.base, this.privateKey)
        }
    }
}