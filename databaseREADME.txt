setting up a local database for scotty finance, instructions for windows (idk about mac but it's probably somewhat similar)

FIRST OF ALL install node.js https://nodejs.org/en
next in the root directory of the project run 'npm install' which will install all the dependencies of the project (listed in package.json in the dependencies)
ok now we can start

this is instructions for setting up a local mysql database for use with the functions given in 'database.js'
the reason to use a local database is that you don't have to actually have a website/domain to host the site on and can just test it on your local machine, on localhost

download mysql installer from https://dev.mysql.com/downloads/installer/

install mysql server and mysql workbench, can select these options to install when you run the installer (should be under the custom install options, make sure the versions are 8.0.36)

[IMPORTANT]
when setting up the server, make the root password literally anything, just put it in a notepad or record it somewhere because you will need it later
the rest of the defaults SHOULD be fine. probably

to create the database, go into mysql workbench, double click 'Local Instance MySQL80', then run 'schema.sql' (this file is in the project directory)
this creates the database and all the tables that will be storing data

to give a lil bit of test data to the database, run 'test.sql' in mysql workbench

in the directory where 'database.js' is (should just be the root directory of the project), create a file called '.env', then copy and paste the following into it:

MYSQL_HOST='127.0.0.1'
MYSQL_USER='root'
MYSQL_PASSWORD=[the password you used before]
MYSQL_DATABASE='scotty_finance'

127.0.0.1 is the address of localhost, you can also write 'localhost' instead if you want
you can call the password literally anything you want as long as it matches with the one you made when you created the database

then you should be done. if you want to completely clear the database, deleting literally everything for some reason you can run 'drop_all_tables.sql' in mysql workbench. this is useful if you just want to wipe the database and start with a fresh one by running 'schema.sql' right after. 

also if you want to display all the tables in the database to see the data that is stored in them currently you can run 'show_all_tables.sql'

if you run into ANY problems WHATSOEVER message clefalto