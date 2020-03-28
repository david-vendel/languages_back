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

linksAlreadyDone = []
      
def getLinksFromUrl(url):      
  print("getting links from url ", url)
  driver.get(url)
  
  main = driver.find_element_by_id('bodyContent')
  
  #print("maiun", main.text)
  
  links = main.find_elements_by_xpath('//a')        
  #print("links", links)
  
  goodlinks = []
  
  for a in links:
      #if "en.wikipedia" in a.get_attribute('href'):
      x = a.get_attribute('href')
      if x is not None:
        if "en.wikipedia" in x and "wiki/Wikipedia" not in x and "#" not in x and "wiki/Talk" not in x and  "wiki/Portal" not in x and "wiki/Special" not in x and "wiki/Help" not in x and "wiki/User" not in x and "wiki/File" not in x and ".org/w/" not in x and "Template" not in x:
          #print(x)
          goodlinks.append(x)
  
  f = open("links.txt", "a")
  f.write("\n".join(goodlinks) )
  f.close()


try:
  f = open("links.txt", "r")
  rlinks = f.read()
  print("rlinks", rlinks)    
except Exception as e:
  print("e", e)
      
for link in rlinks.split("\n"):
  print("link", link)
  if link not in linksAlreadyDone:
    linksAlreadyDone.append(link)
    try:
      getLinksFromUrl(link)
    except Exception as e:
      print("e", e)  