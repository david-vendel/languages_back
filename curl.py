import requests
import html2text 


already = []
f = open("links.txt", "r")
rlinks = f.read()
already = rlinks.split("\n")
print("already", already)



h = html2text.HTML2Text()
# Ignore converting links from HTML
h.ignore_links = True
print (h.handle("<p>Hello, <a href='https://www.google.com/earth/'>world</a>!")  )

print(h.handle("<p>Hello, <a href='https://www.google.com/earth/'>world</a>!"))

def isEnglish(s):
    try:
        s.encode(encoding='utf-8').decode('ascii')
    except UnicodeDecodeError:
        return False
    else:
        return True
        
def writeText(text):
  words = text.replace("."," ").replace("|"," ").replace(","," ").replace("\n"," ").replace(":"," ").replace("!"," ").replace("?"," ").replace("("," ").replace(")"," ").split(" ")
  words = [x for x in words if x]
  words = [x for x in words if isEnglish(x)]
  print("words", words)
  wordsText = " ".join(words)
    
  print("wordsText", wordsText)
        
  f = open("words.txt", "a")
  f.write("\n" + wordsText)
  f.close()

def scrap (url):  

  r = requests.get(url) 
  f = open("links.txt", "a")
  
  text = r.text
  
  writeText (h.handle(text))
  
  texts = text.split('<a href="')

  for x in texts:
    y = x.split('"')[0]
    if "http" not in y and "ikipedia" not in y and "http" not in y and "Category" not in y and "#" not in y and  "html" not in y and "Portal" not in y and "Special" not in y and "Help" not in y and "User" not in y and "Template" not in y and "/w/" not in y and "wikimedia" not in y and "File" not in y and "Talk" not in y:
      if y not in already and "https://en.wikipedia.org" + y not in already:
        print("y", y)
        f.write("\nhttps://en.wikipedia.org"+y)
        already.append(y)
      
  f.close()
  
for x in rlinks.split("\n"):
  print("scrap", x)
  scrap (x)  
