-- create test rows in database

-- test users
INSERT INTO users (username, pass)
VALUES ('TestUser1', 'user1password'),
	   ('TestUser2', 'user2password'),
       ('TestUser3', 'user3password');

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
	
INSERT INTO earnings (budgetId, amount, type)
VALUES ('1', '500', 1),
	   ('1', '400', 3),
       ('2', '50', 4),
       ('3', '300', 5);
