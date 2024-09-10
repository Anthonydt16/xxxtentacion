# tuto mise en prod du bot xxxtentacion

## Etape un !

```terminal
git fetch
git pull
pm2 ls
pm2 delete xxxtentacion
npm run build
pm2 start dist/index.js --node-version 22.6.0 --name xxxtentacion
```
