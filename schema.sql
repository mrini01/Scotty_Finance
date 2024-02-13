CREATE DATABASE scotty_finance;
USE scotty_finance;

CREATE TABLE users (
	id integer PRIMARY KEY AUTO_INCREMENT NOT NULL,
    username VARCHAR(50),
    pass VARCHAR(50)
);

CREATE TABLE budgets (
	id integer PRIMARY KEY AUTO_INCREMENT NOT NULL,
    userId integer,
	`quarter` ENUM('fall', 'winter', 'spring'),
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
	(1, 'entertainment'),
    (2, 'tuition'),
    (3, 'food'),
    (4, 'textbooks'),
    (5, 'transportation');

CREATE TABLE expenses (
	id integer PRIMARY KEY AUTO_INCREMENT NOT NULL,
	budgetId integer,
	amount integer,
    `type` integer not null default 1,
    constraint fk_expense_type foreign key (`type`) references expense_type (id),
    constraint fk_budgetId_1 foreign key (budgetId) references budgets (id)
);

create table earning_type(
	id integer primary key,
    `type` varchar(20)
);

insert into earning_type (id, type)
values
	(0, 'unassigned'),
	(1, 'grant'),
    (2, 'loan'),
    (3, 'wages'),
    (4, 'family'),
    (5, 'savings');

CREATE TABLE earnings (
	id integer PRIMARY KEY AUTO_INCREMENT NOT NULL,
	budgetId integer,
    amount integer,
    `type` integer not null default 1,
    constraint fk_earning_type foreign key (`type`) references earning_type (id),
	constraint fk_budgetId_2 foreign key (budgetId) references budgets (id)
);
