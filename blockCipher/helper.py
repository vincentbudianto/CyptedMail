import math
import base64
import numpy as np
from copy import copy

class Helper:
    @staticmethod
    def convertStringToBinary64(input_string):
        # print(input_string)
        byte_array = bytearray(input_string, "utf8")

        byte_list = []
        for byte in byte_array:
            bin_byte = bin(byte)[2:]
            pad_bit_count = 8 - len(bin_byte)
            for pad_bit in range(pad_bit_count):
                bin_byte = '0' + bin_byte
            byte_list.append(bin_byte)
        
        if (len(byte_list) % 8 != 0):
            for pad in range(8 - (len(byte_list) % 8)):
                bin_byte = '00000000'
                byte_list.insert(0, bin_byte)

        bytes_64 = []
        for i in range(0, len(byte_list), 8):
            result_64 = ''
            for j in range(8):
                result_64 += byte_list[i+j]
            bytes_64.append(result_64)
        
        return bytes_64
    
    @staticmethod
    def convertBinary64ToString(input_binary):
        padded_out = False
        result = ""
        for binary in input_binary:
            splitted_binary = [binary[i:i+8] for i in range(0, len(binary), 8)]
            for splitted_bin in splitted_binary:
                if splitted_bin != '00000000' or padded_out:
                    padded_out = True
                    splitted_bin = '0b' + splitted_bin
                    int_splitted_bin = int(splitted_bin, 2)
                    result += chr(int_splitted_bin)
        # print(result)
        return result

    @staticmethod
    def convertBase64ToString(input_b64):
        bin_input = input_b64.encode('utf-8')
        bin_input = base64.b64decode(bin_input)
        # print('BIN INPUT:', bin_input)
        return bin_input.decode('utf-8')
    
    @staticmethod
    def convertStringToBase64(input_string):
        str_input = input_string.encode('utf-8')
        # print('BIN OUTPUT:', str_input)
        result = base64.b64encode(str_input)
        return result.decode('utf-8')

    
    @staticmethod
    def convertIntToBinary64(int_value):
        byte_list = '{0:064b}'.format(int_value)
        return byte_list
    
    @staticmethod
    def xor(str1, str2):
        if len(str1) != len(str2):
            raise "Error"
        result = ""
        for i in range(len(str1)):
            if (str1[i] == str2[i]):
                result += '0'
            else:
                result += '1'
        return result

    @staticmethod
    def convertFileToBinary64(file_name):
        file = open(file_name, "rb")

        byte_list = []
        byte = file.read(1)
        while byte:
            bin_byte = bin(ord(byte))[2:]
            pad_bit_count = 8 - len(bin_byte)
            for pad_bit in range(pad_bit_count):
                bin_byte = '0' + bin_byte
            byte_list.append(bin_byte)
            byte = file.read(1)
        
        if not len(byte_list) % 8 == 0:
            len_pad = 8 - (len(byte_list) % 8)
        else:
            len_pad = 0

        for pad in range(len_pad):
            bin_byte = '00000000'
            byte_list.insert(0, bin_byte)

        bytes_64 = []
        for i in range(0, len(byte_list), 8):
            result_64 = ''
            for j in range(8):
                result_64 += byte_list[i+j]
            bytes_64.append(result_64)
        
        file.close()
        
        return bytes_64
    
    @staticmethod
    def convertBinary64ToFile(input_binary, file_name):
        padded_out = False

        result = bytearray()

        for binary in input_binary:
            splitted_binary = [binary[i:i+8] for i in range(0, len(binary), 8)]
            for splitted_bin in splitted_binary:
                if splitted_bin != '00000000' or padded_out:
                    padded_out = True
                    splitted_bin = '0b' + splitted_bin
                    int_splitted_bin = int(splitted_bin, 2)
                    result.extend(int_splitted_bin.to_bytes(1, 'big'))
        
        result_bytes = bytes(result)

        file = open(file_name, "wb")
        file.write(result_bytes)
        file.close()

    @staticmethod
    def convertIntToBit(input_int, bit_len):
        bin_byte = bin(input_int)[2:]
        pad_bit_count = bit_len - len(bin_byte)
        for pad_bit in range(pad_bit_count):
            bin_byte = '0' + bin_byte
        return bin_byte

    @staticmethod
    def convertBitToInt(input_bit):
        input_bit = '0b' + input_bit
        return int(input_bit, 2)

    @staticmethod
    def totalAsciiCode(string):
        asciiList = [ord(c) for c in string]
        return sum(asciiList)
    
    @staticmethod
    def randomNChar(n, seed):
        np.random.seed(seed)
        asciiList = np.random.randint(low=33, high=127, size=n)
        result = ""
        for i in range(len(asciiList)):
            result += chr(asciiList[i])
        return result
    
    @staticmethod
    def additionModulo(input_bits, b, m, split_num):
        result = ''
        split_bits = [input_bits[i:i+split_num] for i in range(0, len(input_bits), split_num)]

        for sub_bit in split_bits:
            sub_bit_num = Helper.convertBitToInt(sub_bit)
            sub_bit_num = (sub_bit_num + b) % m
            result += Helper.convertIntToBit(sub_bit_num, split_num)

        return result

    @staticmethod
    def multiplicationModulo(input_bits, b, m, split_num):
        result = ''
        split_bits = [input_bits[i:i+split_num] for i in range(0, len(input_bits), split_num)]

        for sub_bit in split_bits:
            sub_bit_num = Helper.convertBitToInt(sub_bit)
            sub_bit_num = (sub_bit_num * b) % m
            result += Helper.convertIntToBit(sub_bit_num, split_num)

        return result
    
    @staticmethod
    def shiftLeft(byte, n):
        result = list(byte)
        for i in range(n):
            bit = result[0]
            for j in range(7):
                result[j] = result[j+1]
            result[7] = bit
        
        return ''.join(result)

if __name__ == "__main__":
    test_case = '1111101001010011'
    # print(Helper.additionModulo(test_case, 2, 16))
    # print(Helper.convertIntToBit(12))
    # test_input = "abcdefgh"
    # bin_input = Helper.convertStringToBinary64(test_input)
    # print(bin_input)
    # print(Helper.convertBinary64ToString(bin_input))
    # print(Helper.xor('101', '100'))
    # file_bytes = Helper.convertFileToBinary64('ecb.py')
    # print(file_bytes)
    # Helper.convertBinary64ToFile(file_bytes, 'aecb.py')

    # print(file_bytes)