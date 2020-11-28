from helper import Helper
from keyGenerator import KeyGenerator
import numpy as np

import sys

'''
Block cipher
'''
class BlockCipher:
    def set_initial(self, input_name, is_encrypt = True, is_file = False):
        if (is_file):
            self.initial = Helper.convertFileToBinary64(input_name)
        else:
            if (is_encrypt):
                self.initial = Helper.convertStringToBinary64(input_name)
                print('INPUT')
                print(self.initial)
            else:
                print('INPUT')
                print(input_name)
                self.initial = input_name
    
    def write_result(self, file_name = None, is_encrypt = True, is_file = False):
        if (is_file):
            Helper.convertBinary64ToFile(self.result, file_name)
        else:
            print('RESULT')
            print(self.result)
            if (is_encrypt):
                return str(self.result)
            else:
                # print(self.result)
                result = Helper.convertBinary64ToString(self.result)
                return result
    
    def set_key(self, key):
        self.key = Helper.convertStringToBinary64(key)[0]
    
    def execute(self, mode, encrypt=True):
        if mode == "ecb":
            result = self.ecb(self.initial, self.key, encrypt)
        elif mode == "cbc":
            result = self.cbc(self.initial, self.key, encrypt)
        elif mode == "counter":
            result = self.counter(self.initial, self.key, encrypt)

        self.result = result
    
    def ecb(self, stringBlocks, keyBlock, encrypt):
        resultBlocks = []
        for block in stringBlocks:
            resultBlocks.append(self.feistel(block, keyBlock, encrypt))
        
        return resultBlocks
    
    def cbc(self, stringBlocks, keyBlock, encrypt):
        key = Helper.convertBinary64ToString([keyBlock])
        ivString = Helper.randomNChar(8, Helper.totalAsciiCode(key))
        iv = Helper.convertStringToBinary64(ivString)[0] 
        resultBlocks = []
        if (encrypt):
            for i in range(len(stringBlocks)):
                if (i == 0):
                    resultBlocks.append(self.feistel(Helper.xor(iv, stringBlocks[i]), keyBlock, encrypt))
                else:
                    resultBlocks.append(self.feistel(Helper.xor(resultBlocks[i-1], stringBlocks[i]), keyBlock, encrypt))
        else:
            for i in range(len(stringBlocks)):
                if (i == 0):
                    resultBlocks.append(Helper.xor(self.feistel(stringBlocks[i], keyBlock, encrypt), iv))
                else:
                    resultBlocks.append(Helper.xor(self.feistel(stringBlocks[i], keyBlock, encrypt), stringBlocks[i-1]))
        
        return resultBlocks
    
    def counter(self, stringBlocks, keyBlock, encrypt):
        key = Helper.convertBinary64ToString([keyBlock])
        counter_num = Helper.totalAsciiCode(key)
        resultBlocks = []

        for i in range(len(stringBlocks)):
            counterBlock = Helper.convertIntToBinary64(counter_num)
            resultBlocks.append(Helper.xor(self.feistel(counterBlock, keyBlock, encrypt), stringBlocks[i]))
            counter_num += 1
        
        return resultBlocks
    
    def feistel(self, stringBlock, keyBlock, encrypt):
        leftBlock = stringBlock[:32]
        rightBlock = stringBlock[-32:]
        keygen = KeyGenerator(keyBlock, 1, 2)
        sKeyList = []
        xKeyList = []

        for i in range(8):
            keygen.round()
            sKeyList.append(keygen.subKey)
            xKeyList.append(keygen.crossKey)
        
        for i in range(8):
            if (encrypt):
                sKey = sKeyList[i]
                xKey = xKeyList[i]
            else:
                sKey = sKeyList[7-i]
                xKey = xKeyList[7-i]

            fFunc_res = self.fFunc(rightBlock, sKey, xKey)

            leftBlock, rightBlock = rightBlock, Helper.xor(leftBlock, fFunc_res)
        
        leftBlock, rightBlock = rightBlock, leftBlock

        return leftBlock+rightBlock
    
    def fFunc(self, block, sKey, xKey):
        pBox = [16, 15, 13, 27, 21, 25, 14, 18, 2, 8, 7, 19, 3, 24, 28, 4, 10, 5, 12, 0, 6, 1, 29, 31]
        reducedBlock = []

        for idx in pBox:
            reducedBlock.append(block[idx])
        
        for i in range(8):
            reducedBlock[i*3+1] = sKey[i]
        
        for i in range(8, 16):
            reducedBlock.append(sKey[i])
        
        reducedBlock = ''.join(reducedBlock)
        xorResult = Helper.xor(reducedBlock, xKey)

        numOfShift = int(xKey[:4], 2)
        xorResult = Helper.shiftLeft(xorResult, numOfShift)
        
        return xorResult

if __name__ == "__main__":
    input_name = input("Insert file name: ")
    key = input("Insert key (8 characters): ")
    if len(key) != 8:
        print("Key must be 8 characters")
        sys.exit()
    mode = input("Insert mode (ECB/CBC/Counter): ").lower()
    if not (mode == "ecb" or mode == "cbc" or mode == "counter"):
        print("Mode must either be ECB/CBC/Counter")
        sys.exit()
    encrypt = input("Is this encrypt?(Y/N) ").lower()
    output_name = input("Insert output file name: ")

    is_file = "y"
    encrypt = encrypt == "y"

    bc = BlockCipher()
    bc.set_initial(input_name, is_file)
    bc.set_key(key)
    bc.execute(mode, encrypt)
    bc.write_result(output_name, is_file)