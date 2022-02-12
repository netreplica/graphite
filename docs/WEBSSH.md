# SSH to network nodes from a browser

## Pre-requisites

1. Install [Node Version Manager](https://github.com/nvm-sh/nvm), [Node.js](https://nodejs.org/en/) and [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

```Shell
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.bashrc
nvm install 16
node -v
npm -v
````

2. Install [xterm.js](https://xtermjs.org/)

```Shell
cd $HOME/clabs
npm install xterm
ln -s $HOME/node_modules .

````