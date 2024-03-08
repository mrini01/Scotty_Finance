-- WARNING WARNING WARNING THIS IS A DANGEROUS FILE
-- DON'T RUN UNLESS YOU REALLY WANT TO
-- delete everything
-- run this then schema to get a fresh db
use scotty_finance;
set foreign_key_checks = 0;
drop table if exists users, budgets, expense_type, expenses, income_type, incomes, savings;
-- drop table if exists budgets;
-- drop table if exists expense_type;
-- drop table if exists expenses;
-- drop table if exists income_type;
-- drop table if exists incomes;
-- drop table if exists savings;
set foreign_key_checks = 1;