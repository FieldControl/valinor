-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 01/11/2024 às 19:30
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `bdkanban`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `board`
--

CREATE TABLE `board` (
  `idBoard` int(11) NOT NULL,
  `nameBoard` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `card`
--

CREATE TABLE `card` (
  `idCard` int(11) NOT NULL,
  `nameCard` varchar(100) DEFAULT NULL,
  `content` varchar(255) DEFAULT NULL,
  `userCod` int(11) DEFAULT NULL,
  `swimlaneCod` int(11) DEFAULT NULL,
  `order` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `swimlane`
--

CREATE TABLE `swimlane` (
  `idSwimlane` int(11) NOT NULL,
  `nameSwimlane` varchar(100) DEFAULT NULL,
  `order` int(11) DEFAULT NULL,
  `boardCod` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `user`
--

CREATE TABLE `user` (
  `idUser` int(11) NOT NULL,
  `firstName` varchar(100) DEFAULT NULL,
  `lastName` varchar(100) DEFAULT NULL,
  `emailUser` varchar(100) DEFAULT NULL,
  `passwordUser` varchar(200) DEFAULT NULL,
  `emailVerified` tinyint(1) DEFAULT NULL,
  `cardCod` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `userboards`
--

CREATE TABLE `userboards` (
  `userCod` int(11) DEFAULT NULL,
  `boardCod` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `board`
--
ALTER TABLE `board`
  ADD PRIMARY KEY (`idBoard`);

--
-- Índices de tabela `card`
--
ALTER TABLE `card`
  ADD PRIMARY KEY (`idCard`),
  ADD KEY `fk_user` (`userCod`),
  ADD KEY `fk_swimlane` (`swimlaneCod`);

--
-- Índices de tabela `swimlane`
--
ALTER TABLE `swimlane`
  ADD PRIMARY KEY (`idSwimlane`),
  ADD KEY `fk_board` (`boardCod`);

--
-- Índices de tabela `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`idUser`),
  ADD KEY `fk_user_card` (`cardCod`);

--
-- Índices de tabela `userboards`
--
ALTER TABLE `userboards`
  ADD KEY `userCod` (`userCod`),
  ADD KEY `boardCod` (`boardCod`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `board`
--
ALTER TABLE `board`
  MODIFY `idBoard` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `card`
--
ALTER TABLE `card`
  MODIFY `idCard` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `swimlane`
--
ALTER TABLE `swimlane`
  MODIFY `idSwimlane` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `user`
--
ALTER TABLE `user`
  MODIFY `idUser` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `card`
--
ALTER TABLE `card`
  ADD CONSTRAINT `fk_swimlane` FOREIGN KEY (`swimlaneCod`) REFERENCES `swimlane` (`idSwimlane`),
  ADD CONSTRAINT `fk_user` FOREIGN KEY (`userCod`) REFERENCES `user` (`idUser`);

--
-- Restrições para tabelas `swimlane`
--
ALTER TABLE `swimlane`
  ADD CONSTRAINT `fk_board` FOREIGN KEY (`boardCod`) REFERENCES `board` (`idBoard`);

--
-- Restrições para tabelas `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `fk_user_card` FOREIGN KEY (`cardCod`) REFERENCES `card` (`idCard`);

--
-- Restrições para tabelas `userboards`
--
ALTER TABLE `userboards`
  ADD CONSTRAINT `userboards_ibfk_1` FOREIGN KEY (`userCod`) REFERENCES `user` (`idUser`),
  ADD CONSTRAINT `userboards_ibfk_2` FOREIGN KEY (`boardCod`) REFERENCES `board` (`idBoard`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
