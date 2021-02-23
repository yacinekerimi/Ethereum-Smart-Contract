#!/bin/bash


"""
Script pour initialiser la blockchain, avec le fichier genesis.json ou on peut 
modifier les parametres de la BC tel que gasLimit, networkID ..etc
"""

rm -rf geth keystore
geth --datadir . init genesis.json
