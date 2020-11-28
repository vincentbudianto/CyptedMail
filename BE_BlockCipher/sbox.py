import numpy as np
import random as rand
from helper import Helper as h

def generateTest():
    str_test = 'ABCDEFGH'
    return h.convertStringToBinary64(str_test)[0]

class SBox:
    @staticmethod
    def generateRandom(seed, height = 16, randNum = 16):
        numbers = []
        for i in range(randNum):
            numbers.append(i)
        
        result = []
        for i in range(height):
            numbers_copy = numbers.copy()
            rand.seed(seed + i)
            rand.shuffle(numbers_copy)
            result.append(numbers_copy)
        
        print('[', end='')
        for i in range(len(result)):
            print(result[i], end='')
            if (i + 1 != len(result)):
                print(',')
            else:
                print(']')            

    @staticmethod
    def getRowColIdx(input_string):
        row_idx = ''
        col_idx = ''
        for i in range(len(input_string)):
            if i % 2 == 0:
                row_idx += input_string[i]
            else:
                col_idx += input_string[i]
        row_idx = h.convertBitToInt(row_idx)
        col_idx = h.convertBitToInt(col_idx)

        return row_idx, col_idx

    def __init__(self, idx = 1):
        if idx == 1:
            self.sboxKey = np.array([[10, 5, 12, 9, 14, 3, 0, 8, 13, 2, 15, 6, 11, 1, 4, 7],
                [2, 3, 4, 13, 9, 1, 6, 7, 0, 15, 10, 14, 12, 5, 11, 8],
                [13, 1, 8, 3, 6, 10, 9, 5, 14, 15, 11, 0, 4, 12, 7, 2],
                [3, 14, 7, 9, 13, 11, 4, 5, 12, 8, 1, 0, 15, 6, 2, 10],
                [14, 10, 8, 15, 9, 4, 13, 11, 12, 1, 0, 3, 2, 6, 5, 7],
                [3, 1, 6, 8, 10, 15, 12, 7, 13, 0, 11, 2, 4, 5, 9, 14],
                [2, 8, 14, 10, 11, 15, 5, 4, 12, 13, 3, 0, 9, 7, 6, 1],
                [10, 5, 0, 1, 9, 4, 6, 2, 3, 15, 11, 7, 12, 8, 13, 14],
                [1, 7, 14, 11, 12, 3, 9, 0, 6, 2, 5, 13, 8, 10, 4, 15],
                [7, 15, 0, 14, 1, 6, 5, 9, 11, 3, 12, 2, 13, 10, 4, 8],
                [7, 6, 1, 14, 0, 5, 2, 13, 4, 15, 8, 10, 12, 11, 9, 3],
                [4, 9, 7, 10, 1, 5, 15, 13, 12, 3, 2, 14, 11, 8, 0, 6],
                [10, 8, 12, 1, 2, 5, 9, 15, 0, 13, 3, 6, 4, 14, 7, 11],
                [6, 10, 14, 9, 3, 7, 0, 1, 11, 8, 2, 15, 5, 4, 12, 13],
                [4, 0, 6, 11, 2, 9, 14, 8, 12, 13, 3, 15, 7, 10, 1, 5],
                [10, 11, 0, 2, 9, 14, 7, 4, 5, 6, 3, 13, 15, 8, 12, 1]])
        elif idx == 2:
            self.sboxKey = np.array([[0, 11, 13, 8, 4, 7, 3, 6, 10, 5, 9, 14, 2, 12, 15, 1],
                [0, 15, 13, 8, 14, 9, 6, 10, 1, 5, 2, 12, 7, 11, 4, 3],
                [5, 14, 13, 6, 7, 1, 11, 15, 3, 2, 4, 0, 12, 9, 8, 10],
                [0, 3, 14, 1, 7, 6, 13, 4, 10, 8, 5, 15, 11, 9, 12, 2],
                [10, 0, 5, 11, 13, 6, 3, 14, 4, 12, 2, 9, 7, 15, 1, 8],
                [8, 0, 7, 10, 11, 6, 9, 13, 14, 15, 2, 4, 12, 1, 5, 3],
                [4, 3, 15, 13, 11, 2, 10, 1, 5, 12, 8, 0, 7, 6, 9, 14],
                [9, 14, 10, 1, 5, 8, 2, 15, 12, 13, 0, 4, 3, 6, 7, 11],
                [2, 15, 6, 0, 14, 9, 10, 11, 7, 4, 1, 12, 13, 3, 5, 8],
                [7, 8, 12, 9, 14, 3, 5, 2, 0, 15, 13, 11, 10, 4, 1, 6],
                [13, 12, 15, 1, 6, 8, 0, 11, 14, 10, 3, 2, 9, 5, 7, 4],
                [1, 7, 9, 3, 4, 0, 2, 12, 13, 10, 5, 14, 11, 15, 6, 8],
                [11, 10, 1, 9, 4, 15, 3, 12, 2, 0, 7, 6, 13, 8, 5, 14],
                [1, 5, 13, 14, 3, 0, 6, 9, 11, 10, 2, 15, 8, 7, 12, 4],
                [10, 12, 3, 4, 9, 11, 5, 8, 0, 6, 2, 1, 7, 14, 13, 15],
                [1, 10, 15, 2, 4, 6, 11, 3, 5, 8, 13, 7, 0, 12, 14, 9]])
        
    def execute48_24(self, input_string):
        split_num = 8
        split_lines = [input_string[i:i+split_num] for i in range(0, len(input_string), split_num)]
        result = ''
        for split_line in split_lines:
            row_idx, col_idx = self.getRowColIdx(split_line)
            result_int = self.sboxKey[row_idx][col_idx]
            result += h.convertIntToBit(result_int, 4)
        
        return result

if __name__ == "__main__":
    sbox = SBox(2)
    print(sbox.execute48_24(generateTest()))