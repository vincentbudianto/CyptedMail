let ecdsa = require('./ECDSA')
let elliptic = require('./EllipticCurve')
let string = require('./util/string')
let utils = require('./util/utils')

// let bitCount = 17
// let g = 0
// let p = utils.generateBigPrime(bitCount);


/*               CONFIG 1               */
// let a = BigInt(3)
// let b = BigInt(11)
// let p = BigInt(239699)
// let g = [ BigInt(2), BigInt(5)]
// let n = BigInt(182413)
// let ecdsa_code = new ecdsa.ECDSA(a, b, p, g, n)


/*               CONFIG 2               */
// let p = BigInt(6277101735386680763835789423207666416083908700390324961279n)
// 6277101735386680763835789423176059013767194773182842284081
// let n = BigInt(6277101735386680763835789423176059013767194773182842284081n)
// let a = BigInt(-3n)
// let b = BigInt(0x64210519e59c80e70fa7e9ab72243049feb8deecc146b9b1)
// let g = [BigInt(0x188da80eb03090f67cbf20eb43a18800f4ff0afd82ff1012),
//         BigInt(0x07192b95ffc8da78631011ed6b24cdd573f977a11e794811)]
// let ecdsa_code = new ecdsa.ECDSA(a, b, p, g, n)


/*               CONFIG 3                */
let a = BigInt(1)
let b = BigInt(6)
let p = BigInt(811)
let g = [BigInt(0), BigInt(156)]
let n = BigInt(829)
let ecdsa_code = new ecdsa.ECDSA(a, b, p, 0)


/*              VALIDATE PARAMETER                 */
console.log(ecdsa_code.curve.multiplyGraphPoint(ecdsa_code.curve.base, n))


/*              RUN                  */
// console.log('Base =', ecdsa_code.curve.base, '; a =', ecdsa_code.curve.a, '; b =', ecdsa_code.curve.b)
// console.log('n =', ecdsa_code.curve.n, '; binSize =', ecdsa_code.curve.binSize)
// ecdsa_code.setPrivateKeyRandom()

// console.log('Private key =', ecdsa_code.privateKey)
// console.log('Public key =', ecdsa_code.publicKey)

// let signature = ecdsa_code.sign("Kamu, aku, dan kita semua akan bergabung menjadi satu", ecdsa_code.privateKey)
// console.log('Signature =', signature)

// let verified = ecdsa_code.verify("Kamu, aku, dan kita semua akan bergabung menjadi satu", signature, ecdsa_code.publicKey, ecdsa_code.privateKey)
// console.log('Verified =', verified)

// let verifiedFalse = ecdsa_code.verify("Pamu, aku, dan kita semua akan bergabung menjadi satu", signature, ecdsa_code.publicKey, ecdsa_code.privateKey)
// console.log('Verified =', verifiedFalse)

// verifiedFalse = ecdsa_code.verify("Kamu, aku, dan kita semua akan bergabung menjadi dua", signature, ecdsa_code.publicKey, ecdsa_code.privateKey)
// console.log('Verified =', verifiedFalse)