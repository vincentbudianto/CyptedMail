let ecdsa = require('./ECDSA')
let elliptic = require('./EllipticCurve')
let string = require('./util/string')

// console.log(Math.pow(2, 3))
// console.log(ecdsa.validateGraph(1, 1))
// console.log(ecdsa.validateGraph(-3, 2))


let ecdsa_code = new ecdsa.ECDSA(1, 6, 11, 0)
console.log('Base =', ecdsa_code.curve.base, '; a =', ecdsa_code.curve.a, '; b =', ecdsa_code.curve.b)
console.log('n =', ecdsa_code.curve.n, '; binSize =', ecdsa_code.curve.binSize)
ecdsa_code.setPrivateKeyRandom()

console.log(ecdsa_code.privateKey)
console.log(ecdsa_code.publicKey)