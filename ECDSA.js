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

        /**
         * 
         * @param {BigInt} a 
         * @param {BigInt} b 
         * @param {BigInt} p 
         * @param {Array} basePointNum 
         * @param {BigInt} n 
         */
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

        setKeyRandom() {
            let binCount = this.curve.binSize - binReduction
            this.privateKey = utils.getRandomIntRange(binCount, 2n ** binCount + 2n, (this.curve.n - 2n))
            this.privateKeyHex = this.privateKey.toString(16)
            this.publicKey = this.curve.multiplyGraphPoint(this.curve.base, this.privateKey)
            this.publicKeyHex = this.publicKey[0].toString(16) + ' ' + this.publicKey[1].toString(16)
        }

        /**
         * 
         * @param {BigInt} privateKey 
         */
        setPrivateKey(privateKey) {
            this.privateKey = privateKey
            this.privateKeyHex = this.privateKey.toString(16)
        }

        /**
         * 
         * @param {Array} publicKey 
         */
        setPublicKey(publicKey) {
            this.publicKey = publicKey
            this.publicKeyHex = this.publicKey[0].toString(16) + ' ' + this.publicKey[1].toString(16)
        }

        /**
         * 
         * @param {String} privateKeyHex 
         */
        setPrivatekeyHex(privateKeyHex) {
            this.privateKeyHex = privateKeyHex
            this.privateKey = BigInt('0x' + privateKeyHex)
        }

        /**
         * 
         * @param {String} publicKeyHex 
         */
        setPublicKeyHex(publicKeyHex) {
            this.publicKeyHex = publicKeyHex
            let splittedPublic = publicKeyHex.split(" ")
            this.publicKey = [BigInt('0x' + splittedPublic[0]), BigInt('0x' + splittedPublic[1])]
        }
        
        setKeyHex(privateKeyHex) {
            this.privateKeyHex = privateKeyHex
            this.privateKey = BigInt('0x' + privateKeyHex)
            this.publicKey = this.curve.multiplyGraphPoint(this.curve.base, this.privateKey)
            this.publicKeyHex = this.publicKey[0].toString(16) + ' ' + this.publicKey[1].toString(16)
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

        sign(message, privateKey, hexedKey = false, hexedOutput = false) {
            let s = 0n
            let r = 0n
            if (hexedKey) {
                privateKey = BigInt('0x' + privateKey)
            }

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
                    if (isNaN(Number(utils.modInverse(s, this.curve.n)))) {
                        s = 0n
                    } else {
                        // console.log('k =', k, '; qa =', qa, 'e =', e, 'sumEDR =', sumEDR, 'invK =', invK)
                    }
                }
            }

            if (!hexedOutput) {
                return [r, s]
            } else {
                return (r.toString(16) + '|' + s.toString(16))
            }
        }

        verify(message, signature, publicKey, hexedKey = false, hexedSign = false) {
            let r = 0
            let s = 0
            if (hexedKey) {
                let splitted = publicKey.split(" ")
                publicKey = [BigInt('0x' + splitted[0]), BigInt('0x' + splitted[1])]
            }

            if (!hexedSign) {
                r = signature[0]
                s = signature[1]
            } else {
                let splitted = signature.split("|")
                console.log('Signature:', signature)
                console.log('Splitted signature public key:', splitted)
                r = BigInt('0x' + splitted[0])
                s = BigInt('0x' + splitted[1])
            }
            

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

            // STEP 5: calculate X
            let u1g = this.curve.multiplyGraphPoint(this.curve.base, u1)
            let u2q = this.curve.multiplyGraphPoint(publicKey, u2)
            let x = this.curve.sumGraphPoint(u1g, u2q)

            // STEP 6: Validate X not infinite
            if (x[0] === -1 || x[1] === -1) {
                return false
            }
            let x1 = x[0]
            let v = utils.mod(x1, this.curve.n)

            return (v === r)
        }
    }
}