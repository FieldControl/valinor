rd /s /q "prisma\migrations"

call prisma2 migrate save --name init  --experimental
