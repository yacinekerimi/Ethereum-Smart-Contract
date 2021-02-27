#!/bin/bash

"""
Script pour lancer la blockchian et avoir acces a la console
"""

geth --networkid 2020 \
    --datadir . --password password \
    --rpc --rpcapi='db,eth,net,web3,personal' \
    --rpcport '9545' --rpcaddr '127.0.0.1' --rpccorsdomain '*' \ 
    --allow-insecure-unlock \
    console


#geth --rpc --rpcaddr=0.0.0.0 --rpcport 8545 --rpccorsdomain "*" --rpcapi "eth,net,web3,personal,admin,shh,txpool,debug,miner" --nodiscover --maxpeers 30 --networkid 1981 --port 30303
