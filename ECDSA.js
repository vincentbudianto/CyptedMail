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

const byteReduction = 0n // Biar ga lama-lama saat membuat key
const binReduction = 1n

module.exports = {
    ECDSA: class {
        constructor(a, b, p, basePointNum, n) {
            // DEFAULT NIST-192
            if (a === undefined || b === undefined || p === undefined) {
                let p = BigInt(6277101735386680763835789423207666416083908700390324961279n)
                let n = BigInt(6277101735386680763835789423176059013767194773182842284081n)
                let a = BigInt(-3n)
                let b = BigInt(0x64210519e59c80e70fa7e9ab72243049feb8deecc146b9b1)
                let g = [BigInt(0x188da80eb03090f67cbf20eb43a18800f4ff0afd82ff1012),
                        BigInt(0x07192b95ffc8da78631011ed6b24cdd573f977a11e794811)]
                this.curve = new ec.EllipticCurve(a, b, p, g)
                this.curve.setOrderExplicit(n)
            } 
            // BASE POINT NUM EXPLICIT
            else if (isNaN(basePointNum)) {
                this.curve = new ec.EllipticCurve(a, b, p, basePointNum)
                if (n === undefined) {
                    this.curve.setOrder();
                } else {
                    this.curve.setOrderExplicit(n)
                }
            }
            // ONLY A, B, P, and NUMBER G
            else {
                this.curve = new ec.EllipticCurve(a, b, p)
                this.curve.setBasePointNumber(basePointNum)
            }
        }

        setPrivateKey(privateKey) {
            this.privateKey = privateKey
        }

        setPrivateKeyRandom() {
            let binCount = this.curve.binSize - binReduction
            this.privateKey = utils.getRandomIntRange(binCount, 2n ** binCount + 2n, (this.curve.n - 2n))
            this.setPublicKey()
        }

        setPublicKey() {
            this.publicKey = this.curve.multiplyGraphPoint(this.curve.base, this.privateKey)
        }

        initiateK(privateKey) {
            let binCount = this.curve.binSize - binReduction
            let k = utils.getRandomIntRange(binCount, 2n ** binCount, privateKey)
            while (k >= privateKey) {
                k = utils.getRandomIntRange(binCount, 2n ** binCount, privateKey)
            }
            let qa = this.curve.multiplyGraphPoint(this.curve.base, k)
            return [k, qa]
        }

        validatePublicKey(publicKey) {
            if (publicKey[0] === -1 && publicKey[1] === -1) {
                return false;
            }
            let mulPub = this.curve.multiplyGraphPoint(publicKey, this.curve.N)
            if (mulPub[0] === -1 && mulPub[1] === -1) {
                return false;
            }
            return true;
        }

        sign(message, privateKey) {
            let s = 0n
            let r = 0n

            while (s === 0n) {
                // STEP 1 & 2: count k and qa
                let initiate = this.initiateK(privateKey)
                let k = initiate[0]
                let qa = initiate[1]

                // STEP 3: count r, if 0, repeat
                r = utils.mod(qa[0], this.curve.n)
                while (r === 0n) {
                    initiate = this.initiateK()
                    k = initiate[0]
                    qa = initiate[1]
                    r = utils.mod(qa[0], this.curve.n)
                }

                // STEP 4: count k inverse mod n
                let invK = utils.modInverse(k, this.curve.n)
                if (!isNaN(Number(invK))) {
                    // STEP 5: hash and count hash value
                    let hashed = keccak.hash(message, Number(this.curve.binSize / 8n))
                    let e = BigInt(utils.strToHex(hashed))
                    let sumEDR = utils.mod(e + privateKey * r, this.curve.n)    

                    // STEP 6: count s, if 0, repeat
                    s = utils.mod((invK * sumEDR), this.curve.n)
                    // safe method (makes sure)
                    if (isNaN(Number(utils.modInverse(s, this.curve.n)))) {
                        s = 0n
                    } else {
                        console.log('k =', k, '; qa =', qa, 'e =', e, 'sumEDR =', sumEDR, 'invK =', invK)
                    }
                }
            }

            return [r, s]
        }

        verify(message, signature, publicKey, privateKey) {
            let r = signature[0]
            let s = signature[1]

            // STEP 1: VERIFY range of r and s
            if (r >= this.curve.n || r <= 0 || s >= this.curve.n || s <= 0) {
                return false
            }

            // STEP 2: hash and count hash value
            let hashed = keccak.hash(message, Number(this.curve.binSize / 8n))
            let e = BigInt(utils.strToHex(hashed))

            // STEP 3: calculate w
            let w = utils.modInverse(s, this.curve.n)

            // STEP 4: find u1 and u2
            let u1 = utils.mod((e * w), this.curve.n)
            let u2 = utils.mod((r * w), this.curve.n)
            
            // console.log('TEST')
            // console.log('Should be k = ', utils.mod((u1 + u2 * privateKey), this.curve.n))
            // console.log('Should be private key =', privateKey)
            // console.log('Should be public key =', this.curve.multiplyGraphPoint(this.curve.base, privateKey))
            // let shouldBeK = utils.mod((u1 + u2 * this.privateKey), this.curve.n)
            // console.log('Should be result = ', this.curve.multiplyGraphPoint(this.curve.base, shouldBeK))
            // console.log('Public key =', publicKey)
            
            // console.log('TEST POINT')
            // let kMinusD = utils.mod(shouldBeK - privateKey, this.curve.n)
            // console.log(kMinusD)
            // let kMinusDPoint = this.curve.multiplyGraphPoint(this.curve.base, kMinusD)
            // console.log(kMinusDPoint)
            // kMinusDPoint = this.curve.sumGraphPoint(kMinusDPoint, this.curve.base)

            // console.log(this.curve.sumGraphPoint(publicKey, kMinusDPoint))

            // console.log('RANGE POINT')
            // for (let i = -3n; i <= 3n; i++) {
            //     console.log(i, this.curve.multiplyGraphPoint(this.curve.base, shouldBeK + i))
            // }

            // Step 5: calculate X
            let u1g = this.curve.multiplyGraphPoint(this.curve.base, u1)
            // console.log(u1g)
            let u2q = this.curve.multiplyGraphPoint(publicKey, u2)
            let x = this.curve.sumGraphPoint(u1g, u2q)
            // console.log(x)
            // console.log(r)
            // console.log('X total:', x)

            // Step 6: Validate X not infinite
            if (x[0] === -1 || x[1] === -1) {
                return false
            }
            let x1 = x[0]
            let v = utils.mod(x1, this.curve.n)

            // console.log('V =', v)
            // console.log('R =', r)

            // console.log(v === r)

            return (v === r)
        }
    }
}