let blockCipher = require('./BlockCipher')

let initMsg = "Aku ingin makan nasi uduk karena enak"
let key = "asd123pl"

blockCipher.encrypt(initMsg, key).then(encrypted => {
    console.log("ENCRYPTED")
    console.log(encrypted)

    blockCipher.decrypt(encrypted, key).then(decrypted => {
        console.log("DECRYPTED")
        console.log(decrypted)
    })
})