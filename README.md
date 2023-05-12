# auto-scraping

#### How to use

```
Clone the project and run

npm install

#### To start the server
npm run start

#### To start the server in dev mode
npm run dev

As of now it is only supports Amazon

Base Url http://localhost:8000

Query parameters:
platform=amazon (Optional)
search_key=Hard Disk (Required)
records=5 (Optional) default is 3

##Example:
http://localhost:8000/?platform=amazon&search_key=Hard Disk&records=5

Results will downloaded in csv file

#### To run test case
npm run test

```
