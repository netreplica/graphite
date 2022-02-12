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

3. Install [WebSSH2](https://github.com/billchurch/WebSSH2)

```Shell
cd $HOME
git clone https://github.com/billchurch/webssh2.git
cd webssh2/app
npm install
````

## Testing

1. Assuming you have a ContainerLab topology running, run `containerlab inspect` to find out IP addresses of the nodes (make sure to navigate to a proper directory with a topology file)

```Shell
cd $HOME/clabs/ixia-c-one
sudo containerlab inspect -t ixia-c-one-ceos.clab.yaml
````


2. Launch WebSSH2

```Shell
cd $HOME/webssh2/app
npm start
````

2. Connect with a browser `http://CHANGE_IP:2222/ssh/host/USE_ONE_OF_CLAB_NODE_IP`. Authenticate with credentials your emulated node has, and you should have an SSH session running!