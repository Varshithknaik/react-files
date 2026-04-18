<!--  -->

docker build -t distributed-app .

docker run -p 4000:4000 --env-file .env.local varshithknaik/distibuted-order-app

<!-- Example to reset the migration -->

npx dotenv-cli -e .env.local -- sh -c 'cd apps/order-service && npx prisma migrate reset --force'
