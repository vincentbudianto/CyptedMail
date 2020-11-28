import time
from blockCipher import BlockCipher
from helper import Helper

def encrypt_string(text, key):
    bc = BlockCipher()
    bc.set_initial(text)
    bc.set_key(key)
    bc.execute("ecb", encrypt=True)
    result = bc.write_result()
    return Helper.convertStringToBase64(result)

def decrypt_string(text, key):
    bc = BlockCipher()
    text = Helper.convertBase64ToString(text)
    text = eval(text)
    bc.set_initial(text, False)
    bc.set_key(key)
    bc.execute("ecb", encrypt=False)
    result = bc.write_result(None, False)
    return result

if __name__ == "__main__":
    input_name = "Aku ingin makan nasi uduk karena nasi uduk itu enak waw."
    # output_name = "tests/encrypted.png"
    # output_name_2 = "tests/decrypted.png"
    key = "asd123pl"
    # is_file = "n"
    # encrypt = "y"
    # mode = "ecb"

    encrypted = encrypt_string(input_name, key)
    print('ENCRYPTED: ')
    print(encrypted)
    print('\n')
    decrypted = decrypt_string(encrypted, key)
    print('DECRYPTED: ')
    print(decrypted)

    # encrypt_start = time.time()
    # print("ENCRYPTING")
    # bc = BlockCipher()
    # bc.set_initial(input_name, is_file)
    # bc.set_key(key)
    # bc.execute(mode, encrypt)
    # bc.write_result(output_name, is_file)
    # encrpyt_end = time.time()
    # encrypt_time = encrpyt_end - encrypt_start
    # print("Elapsed encrypt time (sec):", encrypt_time, "sec")

    # decrypt_start = time.time()
    # print("DECRYPTING")
    # bc = BlockCipher()
    # encrypt = "n"
    # bc.set_initial(output_name, is_file)
    # bc.set_key(key)
    # bc.execute(mode, encrypt)
    # bc.write_result(output_name_2, is_file)
    # decrypt_end = time.time()
    # decrypt_time = decrypt_start - decrypt_end
    # print("Elapsed decrypt time (sec):", encrypt_time, "sec")