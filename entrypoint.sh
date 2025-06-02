#!/bin/bash

# Correr node api.js en segundo plano
node api.js &

# Correr npm run dev en primer plano
npm run dev
