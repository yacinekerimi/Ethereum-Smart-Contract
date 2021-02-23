#!/bin/bash

"""
Script pour tester la connexion de la blockchain avec le serveur RPC
"""
curl -H "Content-Type: application/json" -X POST --data '{"jsonrpc":"2.0","method":"net_version","params":"[]","id":"2020"}' 127.0.0.1:9545
