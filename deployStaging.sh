cd ~/STAGING/MYPASS-FRONTEND/mypass-frontend

git pull

npm install

pm2 stop frontend

pm2 start --name frontend npm -- start

echo ~~FINISHED~~