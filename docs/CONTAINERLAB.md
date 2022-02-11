# Visualizing ContainerLab topologies

## Prerequisites

0. (Optional) Create an Ubuntu VM for experimentation with Graphite and custom ContainerLab builds, to avoid impacting your working setup. Here is an example with `multipass`:

```Shell
multipass launch 20.04 -n clab-graphite -c4 -m8G -d50G
multipass shell clab-graphite
sudo apt update && sudo apt install build-essential -y
````

1. Install [Go](https://golang.org/dl/) for your platform to build a custom ContainerLab binary. Here is an example for Ubuntu:

```Shell
wget https://go.dev/dl/go1.17.7.linux-amd64.tar.gz
sudo bash -c "rm -rf /usr/local/go && tar -C /usr/local -xzf go1.17.7.linux-amd64.tar.gz"
cat >> ~/.bashrc << EOF
# Local go modules
if [ -d "/usr/local/go/bin" ] ; then
    PATH="\$PATH:/usr/local/go/bin"
fi

# Local go modules
if [ -d "\$HOME/go/bin" ] ; then
    PATH="\$PATH:\$HOME/go/bin"
fi

EOF
source ~/.bashrc
go version
````

2. Build ContainerLab binary with topology export capabilities. Create an alias `clabg` for the binary

  Currently (Feb'22), standard ContainerLab build doesn't have a capability to export topology data model suitable for Graphite. There is a [proposal](https://github.com/srl-labs/containerlab/issues/703) to introduce such option into the product, as well as a possible [implementation](https://github.com/netreplica/containerlab/tree/graph-json). Current Graphite implementation relies on that implementation.
  
  As a prerequisite, please build a custom ContainerLab binary with topology export capabilities. You can continue using official build for all other ContainerLab operations, and use custom build to export topology data.
  
```Shell
git clone https://github.com/netreplica/containerlab.git
cd containerlab
git checkout graph-json
go build
alias clabg="`pwd`/containerlab"
clabg graph -h | grep json
````

  You should see an output with `--json` option designed to `generate json file instead of launching the web server`.