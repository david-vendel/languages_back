f = open("100t.txt", "r")
words = f.read().split("\n")

import random

print("random", random.randint(0, len(words) -1) )

randoms = []

while len(randoms) < 6:
  x = random.randint(0, len(words) -1)
  if x not in randoms:
    randoms.append( x )
    
print ("randoms", randoms) 

for r in randoms:
  print(words[r])   