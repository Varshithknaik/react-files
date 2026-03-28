<!--  -->

docker build -t distributed-app .

docker run -p 4000:4000 --env-file .env.local distributed-app