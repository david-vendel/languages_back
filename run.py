import time
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
import pickle     
import sys

def isEnglish(s):
    try:
        s.encode(encoding='utf-8').decode('ascii')
    except UnicodeDecodeError:
        return False
    else:
        return True
    
chrome_options = Options()
chrome_options.add_argument("--disable-infobars")
#driver = webdriver.Chrome('./assets/chromedriver')  # Optional argument, if not specified will search path.
driver = webdriver.Chrome('./../assets/chromedriver', chrome_options=chrome_options)
          
driver.get('https://en.wikipedia.org/wiki/Main_Page')
          

main = driver.find_element_by_id('bodyContent')

print("maiun", main.text)

words = main.text.replace("."," ").replace(","," ").replace("\n"," ").replace(":"," ").replace("!"," ").replace("?"," ").replace("("," ").replace(")"," ").split(" ")
words = [x for x in words if x]
words = [x for x in words if isEnglish(x)]
print("words", words)
wordsText = " ".join(words)
    
print("wordsText", wordsText)
    
    
f = open("words.txt", "w")
f.write(wordsText)
f.close()