from googletrans import Translator


translator = Translator()


print (translator.translate('yes', dest='fr').text)

f = open("100.txt", "r")
words = f.read().split("\n")

ff = open("100t.txt", "a")

index = 0
startIndex = 690

for word in words:
  index = index + 1
  if index > startIndex:
    tw = translator.translate(word, dest='fr').text
    ff.write("\n" + word + " " + tw)
    print( word + " " + tw)
  
ff.close()