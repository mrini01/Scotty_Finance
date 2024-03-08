CREATE DATABASE scotty_finance;
USE scotty_finance;

CREATE TABLE users (
	id integer PRIMARY KEY AUTO_INCREMENT NOT NULL,
    email VARCHAR(255),
    username VARCHAR(50),
    pass VARCHAR(50)
);

CREATE TABLE budgets (
	id integer PRIMARY KEY AUTO_INCREMENT NOT NULL,
    userId integer,
	`quarter` ENUM('fall', 'winter', 'spring', 'summer'),
    `year` integer,
	constraint fk_userId foreign key (userId) references users (id)
);

create table expense_type (
	id integer primary key,
    `type` varchar(20) not null unique
);

-- literally just an enum but making it strictly constrained
insert into expense_type (id, type)
values
	(0, 'unassigned'),
	(1, 'tuition'),
    (2, 'textbooks'),
    (3, 'transportation'),
    (4, 'loan_student'),
    (5, 'loan_personal'),
    (6, 'food'),
    (7, 'expense_living'),
    (8, 'expense_personal');

CREATE TABLE expenses (
	id integer PRIMARY KEY AUTO_INCREMENT NOT NULL,
	budgetId integer,
	amount integer,
    `type` integer not null default 0,
    constraint fk_expense_type foreign key (`type`) references expense_type (id),
    constraint fk_budgetId_1 foreign key (budgetId) references budgets (id)
);

create table income_type(
	id integer primary key,
    `type` varchar(20)
);

insert into income_type (id, type)
values
	(0, 'unassigned'),
	(1, 'income'),
    (2, 'savings'),
    (3, 'investments');

CREATE TABLE incomes (
	id integer PRIMARY KEY AUTO_INCREMENT NOT NULL,
	budgetId integer,
    amount integer,
    `type` integer not null default 0,
    constraint fk_income_type foreign key (`type`) references income_type (id),
	constraint fk_budgetId_2 foreign key (budgetId) references budgets (id)
);

create table savings (
	id integer PRIMARY KEY AUTO_INCREMENT NOT NULL,
    budgetId integer,
    amount integer,
	constraint fk_budgetId_3 foreign key (budgetId) references budgets (id)
);