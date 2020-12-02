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
let p = BigInt(6277101735386680763835789423207666416083908700390324961279n)
let n = BigInt(6277101735386680763835789423176059013767194773182842284081n)
let a = BigInt(-3n)
let b = BigInt(2455155546008943817740293915197451784769108058161191238065n)
let g = [BigInt(602046282375688656758213480587526111916698976636884684818n),
        BigInt(174050332293622031404857552280219410364023488927386650641n)]
let ecdsa_code = new ecdsa.ECDSA(a, b, p, g, n)


/*               CONFIG 3                */
// let a = BigInt(1)
// let b = BigInt(6)
// let p = BigInt(811)
// let g = [BigInt(0), BigInt(156)]
// let n = BigInt(829)
// let ecdsa_code = new ecdsa.ECDSA(a, b, p, 0)


/*              VALIDATE PARAMETER                 */
// console.log(ecdsa_code.curve.multiplyGraphPoint(ecdsa_code.curve.base, n))


/*              RUN                  */
// console.log('Base =', ecdsa_code.curve.base, '; a =', ecdsa_code.curve.a, '; b =', ecdsa_code.curve.b)
// console.log('n =', ecdsa_code.curve.n, '; binSize =', ecdsa_code.curve.binSize)
// ecdsa_code.setKeyRandom()
// ecdsa_code
// ecdsa_code.setPrivatekeyHex('d2144a6e3ef71a1e5fef25c51696c07dda1d6f641ba1ef34')
ecdsa_code.setPublicKeyHex('2197b5e2bb8eee1ea8ebc122417612ffc9b2f957aab4a3c9 bb14232ecaa0020bc899ee8ee4e85b44bf0a9e3bb1da781a')

console.log('Private key =', ecdsa_code.privateKeyHex)
console.log('Public key =', ecdsa_code.publicKeyHex)

// let signature = ecdsa_code.sign("Kamu, aku, dan kita semua akan bergabung menjadi satu", ecdsa_code.privateKeyHex, hexedKey = true, hexedOutput = true)
// console.log('Signature =', signature)

let verified = ecdsa_code.verify("Kamu, aku, dan kita semua akan bergabung menjadi satu", signature, ecdsa_code.publicKeyHex, hexedKey = true, hexedSign = true)
console.log('Verified =', verified)

let verifiedFalse = ecdsa_code.verify("Pamu, aku, dan kita semua akan bergabung menjadi satu", signature, ecdsa_code.publicKeyHex, hexedKey = true, hexedSign = true)
console.log('Verified =', verifiedFalse)

verifiedFalse = ecdsa_code.verify("Kamu, aku, dan kita semua akan bergabung menjadi dua", signature, ecdsa_code.publicKeyHex, hexedKey = true, hexedSign = true)
console.log('Verified =', verifiedFalse)