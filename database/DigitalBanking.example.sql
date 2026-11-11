-- Synthetic demo data only. Do not use in production.
IF DB_ID(N'DigitalBanking') IS NULL
    CREATE DATABASE [DigitalBanking];
GO

USE [DigitalBanking];
GO

CREATE TABLE [dbo].[Roles] (
    [role_id] int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [role_name] varchar(50) NOT NULL
);
GO

CREATE TABLE [dbo].[Users] (
    [users_id] int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [username] varchar(50) NOT NULL UNIQUE,
    [password] varchar(255) NOT NULL,
    [full_name] nvarchar(100) NOT NULL,
    [cccd] varchar(20) NULL,
    [date_of_birth] date NULL,
    [phone] varchar(15) NULL,
    [email] varchar(100) NULL,
    [address] nvarchar(255) NULL,
    [role_id] int NOT NULL,
    [status] varchar(20) NULL CONSTRAINT [DF_Users_Status] DEFAULT ('ACTIVE'),
    [created_at] datetime NULL CONSTRAINT [DF_Users_CreatedAt] DEFAULT (GETDATE()),
    CONSTRAINT [FK_Users_Roles] FOREIGN KEY ([role_id]) REFERENCES [dbo].[Roles] ([role_id])
);
GO

CREATE TABLE [dbo].[BANK_ACCOUNTS] (
    [account_id] int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [user_id] int NOT NULL,
    [account_no] varchar(20) NOT NULL UNIQUE,
    [balance] decimal(18,2) NULL CONSTRAINT [DF_BankAccounts_Balance] DEFAULT (0),
    [status] varchar(20) NULL CONSTRAINT [DF_BankAccounts_Status] DEFAULT ('ACTIVE'),
    [created_at] datetime NULL CONSTRAINT [DF_BankAccounts_CreatedAt] DEFAULT (GETDATE()),
    CONSTRAINT [FK_BankAccounts_Users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users] ([users_id])
);
GO

CREATE TABLE [dbo].[BENEFICIARIES] (
    [beneficiary_id] int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [user_id] int NOT NULL,
    [account_no] varchar(20) NOT NULL,
    [name] nvarchar(100) NOT NULL,
    [bank_name] nvarchar(100) NULL,
    CONSTRAINT [FK_Beneficiaries_Users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users] ([users_id])
);
GO

CREATE TABLE [dbo].[TRANSACTIONS] (
    [transaction_id] int IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [sender_account] int NOT NULL,
    [receiver_account] int NOT NULL,
    [amount] decimal(18,2) NOT NULL,
    [content] nvarchar(255) NULL,
    [transaction_time] datetime NULL CONSTRAINT [DF_Transactions_Time] DEFAULT (GETDATE()),
    [status] varchar(20) NULL CONSTRAINT [DF_Transactions_Status] DEFAULT ('SUCCESS'),
    CONSTRAINT [FK_Transactions_Sender] FOREIGN KEY ([sender_account]) REFERENCES [dbo].[BANK_ACCOUNTS] ([account_id]),
    CONSTRAINT [FK_Transactions_Receiver] FOREIGN KEY ([receiver_account]) REFERENCES [dbo].[BANK_ACCOUNTS] ([account_id])
);
GO

INSERT INTO [dbo].[Roles] ([role_name]) VALUES ('ADMIN'), ('CUSTOMER');

INSERT INTO [dbo].[Users]
    ([username], [password], [full_name], [role_id], [status])
VALUES
    ('admin', 'demo123', N'Demo Administrator', 1, 'ACTIVE'),
    ('demo-user', 'demo123', N'Demo Customer', 2, 'ACTIVE');

INSERT INTO [dbo].[BANK_ACCOUNTS]
    ([user_id], [account_no], [balance], [status])
VALUES
    (1, '9000000001', 1000000.00, 'ACTIVE'),
    (2, '9000000002', 250000.00, 'ACTIVE');

INSERT INTO [dbo].[TRANSACTIONS]
    ([sender_account], [receiver_account], [amount], [content], [status])
VALUES
    (1, 2, 1000.00, N'DEMO SAMPLE', N'Thành công');
GO
