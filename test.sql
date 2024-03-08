-- create test rows in database

-- test users
INSERT INTO users (username, pass, email)
VALUES ('TestUser1', 'user1password', 'testuser1@testwebsite.com'),
	   ('TestUser2', 'user2password', 'testuser2@othertestwebsite.com'),
       ('TestUser3', 'user3password', 'testuser3@what.com');

-- test budgets, belongs to testuser1, testuser2, testuser3 respectively
INSERT INTO budgets (userId, quarter, year)
VALUES ('1', 'fall', '2023'),
	   ('2', 'winter', '2024'),
       ('3', 'spring', '2024');

INSERT INTO expenses (budgetId, amount, type)
VALUES ('1', '300', 2),
	   ('2', '50', 3),
       ('2', '12', 1),
       ('3', '500', 5);
	
INSERT INTO incomes (budgetId, amount, type)
VALUES ('1', '500', 1),
	   ('1', '400', 3),
       ('2', '50', 2),
       ('3', '300', 3);

INSERT INTO savings (budgetId, amount)
VALUES ('1', '1000'),
	   ('2', '500'),
       ('3', '750');
