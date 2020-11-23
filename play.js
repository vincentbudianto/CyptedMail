const { modInverse } = require("./util/utils");
const { EllipticCurve } = require("./EllipticCurve")

// console.log(modInverse(4n, 7n))
// console.log(modInverse(2n, 7n))

let a = BigInt(1)
let b = BigInt(6)
let p = BigInt(811)
let g = [BigInt(0), BigInt(156)]

ec = new EllipticCurve(a, b, p, g)
ec.setOrder()
console.log('Base =', ec.base, '; a =', ec.a, '; b =', ec.b)
console.log('n =', ec.n, '; binSize =', ec.binSize)

let k = 9n
let a2 = 3n
let b2 = 2n

let base = ec.base
let base2 = ec.multiplyGraphPoint(ec.base, 3n)

console.log(base)
console.log(base2)

let target = ec.multiplyGraphPoint(ec.base, k)
console.log(target)

let sum1 = ec.multiplyGraphPoint(base, a2)
let sum2 = ec.multiplyGraphPoint(base2, b2)
let total = ec.sumGraphPoint(sum1, sum2)
console.log(total)

for(let i = 1n; i < 15n; i++) {
    console.log(i, ec.multiplyGraphPoint(ec.base, i))
}

console.log("BAM")
console.log(ec.multiplyGraphPoint(ec.base, (ec.n + 1n)))