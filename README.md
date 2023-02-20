# BlockChain
My first Blockchain project

# Author
Mohammad Afaq
mafaqq318@gmail.com


# Tools Required on Linux 22.04:

## Code Editor - Visual Studio Code
## Node.js
Verify node is intalled using
### node -v
### npm -v
- npm init -y 
- npm install jest@23.6.0 --save-dev (used for testing)
- npm i hex-to-binary@1.0.1 --save (to convert hex to binary format)
- npm i express@4.16.3 --save (to make api calls between frontend and backend and other chains)
- npm i nodemon@1.18.4 --save-dev (node engine reruns application after file changes)
- npm i body-parser@1.18.3 --save (express middleware)
- npm i redis@2.8.0 --save (Pub/Sub blockchain requests)
- npm i cross-env@5.2.0 --save-dev (allows us to set environmental variables programmiticaly regardless of OS and Terminal type)
- npm i request@2.88.0 --save (abilty to send http requests)

## Postman
Install from snapstore

##SUDO
- sudo apt-get install redis-server

# reference Git Link
https://github.com/15Dkatz/cryptochain

#helpful commands:
- ps aux | grep redis (to kill already running redis server kill -9 id)
- sudo lsof -i :3000 (to find out if port is being used )
- killall -9 node (kills all tasks using nodes)
