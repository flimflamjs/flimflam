#!/bin/bash
echo 'building all files...'
babel autocomplete/index.es6 > autocomplete/index.js
babel button/index.es6 > button/index.js
babel confirmation/index.es6 > confirmation/index.js
babel modal/index.es6 > modal/index.js
babel notification/index.es6 > notification/index.js
babel tabswap/index.es6 > tabswap/index.js
babel validated-form/index.es6 > validated-form/index.js
babel wizard/index.es6 > wizard/index.js
echo '..done'
