let string = require('./util/string')
let utils = require('./util/utils')

module.exports = {
    EllipticCurve: class{
        constructor(a, b, p, g) {
            this.a = BigInt(a)
            this.b = BigInt(b)
            this.p = BigInt(p)
            if (g === undefined) {
                this.generatePoints()
            } else {
                this.base = g
            }
            
        }

        validateGraph() {
            if (4 * Math.pow(this.a, 3) + 27 * Math.pow(this.b, 2) === 0) {
                return false
            }
            if (!utils.isPrime(this.p)) {
                return false
            }
            return true
        }

        generatePoints() {
            let equation = `y^2 = x^3 + ${this.a}x + ${this.b} mod ${this.p}`
            // console.log('Equation = ' + equation)

            let points = []
            
            for(let i = 0n; i < this.p; i++) {
                let y_2 = utils.mod((i ** 3n + i * this.a + this.b), this.p)
                for(let j = 0n; j < this.p; j++) {
                    if (utils.mod(j ** 2n, this.p) === y_2) {
                        points.push([i, j])
                        // console.log(points)
                    }
                }
            }
            this.points = points
        }
        
        /**
         * 
         * @param {Array} p 
         * @param {Array} q 
         */
        countGradient(p, q) {
            if (p[0] === q[0]) {
                return NaN
            }

            let numerator = p[1] - q[1]
            let denominator = p[0] - q[0]
            if (denominator < 0) {
                numerator *= -1n
                denominator *= -1n
            }

            let modInverse = utils.modInverse(denominator, this.p)
            let m = utils.mod((numerator * modInverse), this.p)
            
            return m
        }
        
        /**
         * 
         * @param {Array} p 
         */
        countGradientDouble(p) {
            if (p[1] === 0) {
                return NaN
            }

            let numerator = 3n * (p[0] ** 2n) + this.a
            let denominator = 2n * p[1]

            if (denominator < 0) {
                numerator *= -1n
                denominator *= -1n
            }

            let modInverse = utils.modInverse(denominator, this.p)
            let m = utils.mod((numerator * modInverse), this.p)
            
            return m
        }

        /**
         * 
         * @param {Array} p 
         * @param {Array} q 
         */
        sumGraphPoint(p, q) {
            // console.log('P', p, '; Q', q)
            if (p[0] === q[0] && p[1] === q[1]) {
                return this.doubleGraphPoint(p)
            }
            if (p[0] === -1n && p[1] === -1n) {
                return q
            }
            if (q[0] === -1n && q[1] === -1n) {
                return p
            }
            if (p[0] === q[0]) {
                return [-1n, -1n]
            }
            let m = this.countGradient(p, q)
            let xr = utils.mod((m ** 2n - p[0] - q[0]), this.p)
            let yr = utils.mod((m * (p[0] - xr) - p[1]), this.p)
            // console.log(m, [xr, yr])
            return [xr, yr]
        }

        /**
         * 
         * @param {Array} p 
         */
        doubleGraphPoint(p) {
            let m = this.countGradientDouble(p)
            if (m === NaN) {
                return [-1n, -1n]
            }
            let xr = utils.mod(((m ** 2n) - 2n * p[0]), this.p)
            let yr = utils.mod((m * (p[0] - xr) - p[1]), this.p)
            return [xr, yr]
        }
        
        /**
         * 
         * @param {Array} p 
         * @param {Number} k 
         */
        multiplyGraphPoint(p, k) {
            // console.log('IN', p, k)
            if (k < 1n) {
                return [-1n, -1n]
            }
            if (k === 1n) {
                return p;
            }
            let result = this.doubleGraphPoint(p)
            for (let i = 3; i <= k; i++) {
                result = this.sumGraphPoint(result, p)
                if (i % 10000000 === 0) {
                    // console.log(i)
                }
            }
            return result
        }

        
        
        /**
         * 
         * @param {Array} p 
         */
        setBasePoint(p) {
            this.base = p
            this.setOrder()
        }

        /**
         * 
         * @param {Number} num 
         */
        setBasePointNumber(num) {
            // console.log(this.points)
            if (num >= this.points || num <= 0) {
                this.base = this.points[0] 
            } else {
                this.base = this.points[num]
            }
            this.setOrder()
        }
        
        /**
         * ONLY FOR LOW INTEGER BASE POINT (TOO LONG)
         */
        setOrder() {
            let curPoint = this.base
            let i = 1n

            while (curPoint[0] !== -1n && curPoint[1] !== -1n) {
                curPoint = this.sumGraphPoint(curPoint, this.base)
                // console.log(i, curPoint)
                i++
            }
            this.n = i
            this.binSize = utils.dec2binCount(this.n)
        }

        setOrderExplicit(n) {
            this.n = n
            this.binSize = utils.dec2binCount(this.n)
        }
    }
}