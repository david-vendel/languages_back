f = open("words.txt", "r")
#print(f.read())

book = f.read()


def tokenize():
    if book is not None:
        words = book.lower().split()
        return words
    else:
        return None
        

def map_book(tokens):
    hash_map = {}

    if tokens is not None:
        for element in tokens:
            # Remove Punctuation
            word = element.replace(",","").replace(".","").replace('"', "").replace("'", "")

            # Word Exist?
            if word in hash_map:
                hash_map[word] = hash_map[word] + 1
            else:
                hash_map[word] = 1

        return hash_map
    else:
        return None

def goodWord(x):
  if "*" in x or "/" in x or "[" in x or "]" in x or "-" in x or "\\" in x or "_" in x or "#" in x or "&" in x or "^" in x or ";" in x:
    return False
  if "0" in x or "1" in x or "2" in x or "3" in x or "4" in x or "5" in x or "6" in x or "7" in x or "8" in x or "9" in x:
    return False
  if x == "a":
    return True
  if len(x) <2:
    return False
  return True  

# Tokenize the Book
words = tokenize()
word_list = words

# Create a Hash Map (Dictionary)
map = map_book(words)
#print("map", map)

# Show Word Information
for word in word_list:
    pass
    #print('Word: [' + word + '] Frequency: ' + str(map[word]))
    
import operator
x = map #{1: 2, 3: 4, 4: 3, 2: 1, 0: 0}
sorted_x = sorted(x.items(), key=operator.itemgetter(1))

#print("sorted_x", sorted_x)

words = []
for x in sorted_x:
  #print("x", x[0])
  words.append(x[0])
  
#print(words[::-1] )

ww = words[::-1]
ww = [x for x in ww if goodWord(x)]

print("ww", ww)

f = open("ww.txt", "w+")
f.write("\n".join(ww))
f.close()