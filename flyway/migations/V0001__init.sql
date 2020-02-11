CREATE TABLE `c572ymepzv3e1tq5`.`cliente` (
    `endereco` varchar(191) NOT NULL ,
    `id` varchar(191) NOT NULL  ,
    `nome` varchar(191) NOT NULL DEFAULT '' ,
    `telefone` varchar(191) NOT NULL DEFAULT '' ,
    PRIMARY KEY (`id`);
) 
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci

CREATE TABLE `c572ymepzv3e1tq5`.`produto` (
    `codigo` varchar(191)   ,
    `descricao` varchar(191) NOT NULL DEFAULT '' ,
    `id` varchar(191) NOT NULL  ,
    `preco` Decimal(65,30) NOT NULL DEFAULT 0 ,
    PRIMARY KEY (`id`)
) 
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `c572ymepzv3e1tq5`.`item` (
    `atendimento` varchar(191) NOT NULL ,
    `cancelado` boolean NOT NULL DEFAULT false ,
    `descricao` varchar(191) NOT NULL DEFAULT '' ,
    `id` varchar(191) NOT NULL  ,
    `precoUnitario` Decimal(65,30) NOT NULL DEFAULT 0 ,
    `produto` varchar(191) NOT NULL ,
    `quantidade` Decimal(65,30) NOT NULL DEFAULT 0 ,
    `valor` Decimal(65,30) NOT NULL DEFAULT 0 ,
    PRIMARY KEY (`id`)
) 
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `c572ymepzv3e1tq5`.`finalizadora` (
    `descricao` varchar(191) NOT NULL DEFAULT '' ,
    `id` varchar(191) NOT NULL  ,
    PRIMARY KEY (`id`)
) 
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `c572ymepzv3e1tq5`.`pagamento` (
    `atendimento` varchar(191) NOT NULL ,
    `cancelado` boolean NOT NULL DEFAULT false ,
    `finalizadora` varchar(191) NOT NULL ,
    `id` varchar(191) NOT NULL  ,
    `troco` Decimal(65,30) NOT NULL DEFAULT 0 ,
    `valor` Decimal(65,30) NOT NULL DEFAULT 0 ,
    PRIMARY KEY (`id`)
) 
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `c572ymepzv3e1tq5`.`endereco` (
    `bairro` varchar(191) NOT NULL DEFAULT '' ,
    `cep` varchar(191) NOT NULL DEFAULT '' ,
    `cidade` varchar(191) NOT NULL DEFAULT '' ,
    `id` varchar(191) NOT NULL  ,
    `logradouro` varchar(191) NOT NULL DEFAULT '' ,
    PRIMARY KEY (`id`)
) 
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `c572ymepzv3e1tq5`.`atendimento` (
    `arquivado` boolean NOT NULL DEFAULT false ,
    `cliente` varchar(191)  ,
    `dataAbertura` datetime(3) NOT NULL DEFAULT '1970-01-01 00:00:00' ,
    `dataEncerramento` datetime(3)   ,
    `enderecoEntrega` varchar(191)  ,
    `id` varchar(191) NOT NULL  ,
    `status` varchar(191) NOT NULL DEFAULT 'ABERTO' ,
    `valorEntrega` Decimal(65,30) NOT NULL DEFAULT 0 ,
    `valorPago` Decimal(65,30) NOT NULL DEFAULT 0 ,
    `valorPedido` Decimal(65,30) NOT NULL DEFAULT 0 ,
    `valorTotal` Decimal(65,30) NOT NULL DEFAULT 0 ,
    PRIMARY KEY (`id`)
) 
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `c572ymepzv3e1tq5`.`cliente` ADD FOREIGN KEY (`endereco`) REFERENCES `c572ymepzv3e1tq5`.`endereco`(`id`) ON DELETE RESTRICT;

ALTER TABLE `c572ymepzv3e1tq5`.`item` ADD FOREIGN KEY (`produto`) REFERENCES `c572ymepzv3e1tq5`.`produto`(`id`) ON DELETE RESTRICT;

ALTER TABLE `c572ymepzv3e1tq5`.`item` ADD FOREIGN KEY (`atendimento`) REFERENCES `c572ymepzv3e1tq5`.`atendimento`(`id`) ON DELETE RESTRICT;

ALTER TABLE `c572ymepzv3e1tq5`.`pagamento` ADD FOREIGN KEY (`finalizadora`) REFERENCES `c572ymepzv3e1tq5`.`finalizadora`(`id`) ON DELETE RESTRICT;

ALTER TABLE `c572ymepzv3e1tq5`.`pagamento` ADD FOREIGN KEY (`atendimento`) REFERENCES `c572ymepzv3e1tq5`.`atendimento`(`id`) ON DELETE RESTRICT;

ALTER TABLE `c572ymepzv3e1tq5`.`atendimento` ADD FOREIGN KEY (`cliente`) REFERENCES `c572ymepzv3e1tq5`.`cliente`(`id`) ON DELETE SET NULL;

ALTER TABLE `c572ymepzv3e1tq5`.`atendimento` ADD FOREIGN KEY (`enderecoEntrega`) REFERENCES `c572ymepzv3e1tq5`.`endereco`(`id`) ON DELETE SET NULL;