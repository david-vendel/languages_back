server runs at 8000, https://github.com/justdvl/languages_back

react at 3000 https://github.com/justdvl/languages_front

Set up SERVER address for cross policy and your port as well in .env:

NODE_PORT=8000
SERVER_IP=http://localhost:3000
GOOGLE_TRANSLATE_API_KEY=<...>

You will need the latter to be able to translate on server side

This is server. MongoDB is required. db/collection: nodekb.languages

To run on Win: first run mongod.exe then cmd as admin, mongo

Server is started with command nodemon index

How to use: First go to Settings and upload a frequencies file (1 word per line). Then get frequencies and translate frequencies them (bottom button). You need to wait for this to be done, othwerise app won't work (Dict won't be created)
