import {PythonShell} from 'python-shell';

module.exports = {
    encrypt: function(plainText, key) {
        let options = {
            mode: 'text',
            pythonPath: 'D:/Installed Programs/Python/Scripts',
            pythonOptions: ['-u'],
            scriptPath: 'BE_BlockCipher/blockCipher.py',
            args: [plainText, key]
        }
        
    },

    decrypt: function(cipherText, key) {

    }
}