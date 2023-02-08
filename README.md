# Dashboard Project

## Prerequisites

### Changes before Application start
1. Mention the Images root path (which is static/fixed) in .env file in server Directory

    Example : Images ="C:/Users/AppsTekO16/Downloads/Images/02Aug2022/AreaScan"

    C:/Users/AppsTekO16/Downloads/Images/ - root path

2.Update the "Fname" Variable with last folder of the root path in .env file in server Directory

    Example:

            Fname = "/Images"

3. Update the "REACT_APP_Client_Images" Variable in .env file in client  with  "Fname" varible in .env file in server

    Example:

            REACT_APP_Client_Images="/Images" #Fname and REACT_APP_Client_Images sholud have same path

4. Update the Database relative path in .env file in server Directory

    Database="./db/MyDatabase_NFPC.sqlite"


### Install Node JS for Clint
Run command - npm install
              

### Install Node JS for Server
Run command - npm install 

### Start for Clint
Run on cmd and the path should be in the client code folder
Run command - npm run start
              

### Strat for Server
Run on CMD and the path should be in the server code folder
Run command - npm run dev 