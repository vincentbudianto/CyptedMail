let string = require('./util/string')
let utils = require('./util/utils')

module.exports = {
    EllipticCurve: class{
        constructor(a, b, p) {
            this.a = a
            this.b = b
            this.p = p
            this.generatePoints()
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
            
            for(let i = 0; i < this.p; i++) {
                let y_2 = string.mod((Math.pow(i, 3) + i * this.a + this.b), this.p)
                for(let j = 0; j < this.p; j++) {
                    if (string.mod(Math.pow(j, 2), this.p) === y_2) {
                        points.push([i, j])
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
                numerator *= -1
                denominator *= -1
            }

            let modInverse = string.modInverse(denominator, this.p)
            let m = string.mod((numerator * modInverse), this.p)
            
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

            let numerator = 3 * Math.pow(p[0], 2) + this.a
            let denominator = 2 * p[1]

            if (denominator < 0) {
                numerator *= -1
                denominator *= -1
            }

            let modInverse = string.modInverse(denominator, this.p)
            let m = string.mod((numerator * modInverse), this.p)
            
            return m
        }

        /**
         * 
         * @param {Array} p 
         * @param {Array} q 
         */
        sumGraphPoint(p, q) {
            if (p[0] === q[0] && p[1] === q[1]) {
                return this.doubleGraphPoint(p)
            }
            if (p[0] === -1 && p[1] === -1) {
                return q
            }
            if (q[0] === -1 && q[1] === -1) {
                return p
            }
            if (p[0] === q[0]) {
                return [-1, -1]
            }
            let m = this.countGradient(p, q)
            let xr = string.mod((Math.pow(m, 2) - p[0] - q[0]), this.p)
            let yr = string.mod((m * (p[0] - xr) - p[1]), this.p)
            return [xr, yr]
        }

        /**
         * 
         * @param {Array} p 
         * @param {Array} q 
         */
        minusGraphPoint(p, q) {
            let tempQ = [q[0], string.mod((-q[1]), this.p)]
            let m = this.countGradient(p, tempQ)
            if (m === NaN) {
                return [-1, -1]
            }
            let xr = string.mod((Math.pow(m, 2) - p[0] - tempQ[0]), this.p)
            let yr = string.mod((m * (p[0] - xr) - p[1]), this.p)
            return [xr, yr]
        }

        /**
         * 
         * @param {Array} p 
         */
        doubleGraphPoint(p) {
            let m = this.countGradientDouble(p)
            if (m === NaN) {
                return [-1, -1]
            }
            let xr = string.mod((Math.pow(m, 2) - 2 * p[0]), this.p)
            let yr = string.mod((m * (p[0] - xr) - p[1]), this.p)
            return [xr, yr]
        }
        
        /**
         * 
         * @param {Array} p 
         * @param {Number} k 
         */
        multiplyGraphPoint(p, k) {
            if (k < 1) {
                return [-1, -1]
            }
            if (k === 1) {
                return p;
            }
            let result = this.doubleGraphPoint(p)
            // console.log(1, result)
            for (let i = 2; i <= k; i++) {
                result = this.sumGraphPoint(result, p)
                // console.log(i, result)
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
            if (num >= this.points.length || num <= 0) {
                this.base = this.points[0] 
            } else {
                this.base = this.points[num]
            }
            this.setOrder()
        }
        
        setOrder() {
            let curPoint = this.base
            let i = 0
            while (curPoint[0] !== -1 && curPoint[1] !== -1) {
                curPoint = this.sumGraphPoint(curPoint, this.base)
                i++
            }
            this.n = i
            let nBinary = utils.dec2bin(this.n)
            this.binSize = nBinary.length
        }
    }
}