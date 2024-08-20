#!/bin/sh

/wait-for-it.sh db:5432 -- npx prisma migrate dev

npm run start:dev