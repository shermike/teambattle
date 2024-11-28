#!/bin/bash

nil keygen new

for i in {1..6}; do
    echo "P$i `nil wallet new --salt 1$i -q --amount 10000000000`"
done
