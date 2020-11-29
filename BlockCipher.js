let ps = require('python-shell')
// ps = ps.PythonShell

module.exports = {
    encrypt: function(plainText, key) {
        let options = {
            mode: 'text',
            encoding: 'utf8',
            pythonPath: 'D:/Installed Programs/Python/python',
            pythonOptions: ['-u'],
            scriptPath: './BE_BlockCipher/',
            args: ['encrypt', plainText, key]
        }

        return new Promise((resolve, reject) => {
            let result
            let pyshell = new ps.PythonShell('runner.py', options)

            pyshell.on('message', function(message) {
                result = message;
            });
          
            pyshell.on('stderr', function(stderr) {
                console.log(stderr);
            });
            
            pyshell.end(function(err, code, signal) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            })
        })
    },

    decrypt: function(cipherText, key) {
        let options = {
            mode: 'text',
            encoding: 'utf8',
            pythonPath: 'D:/Installed Programs/Python/python',
            pythonOptions: ['-u'],
            scriptPath: './BE_BlockCipher/',
            args: ['decrypt', cipherText, key]
        }

        return new Promise((resolve, reject) => {
            let result
            let pyshell = new ps.PythonShell('runner.py', options)

            pyshell.on('message', function(message) {
                result = message;
            });
          
            pyshell.on('stderr', function(stderr) {
                console.log(stderr);
            });
            
            pyshell.end(function(err, code, signal) {
                if (err) {
                    reject(err);
                }
                resolve(result);
            })
        })
    }
}