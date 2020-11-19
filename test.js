var Keccak = require('./Keccak')

console.log(Keccak.hash("Kamu, aku, dan kita semua akan bergabung menjadi satu", 32));
console.log(Keccak.hash("Kamu, aku, dan kita semua akan bergabung menjadi sate", 32));
console.log(Keccak.hash("Tamu, aku, dan kita semua akan bergabung menjadi sate", 32));
