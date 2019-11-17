# Running the Server

## Create .env

Create a file called `.env` with credentials in the following format:

```txt
ATLASUSER=usernameForMongo
ATLASPASS=passwordForMongo
ENVIRONMENT=development
```

## Activate venv

```bash
python3 -m venv env
source env/bin/activate
```

## Install requirements

```bash
pip3 install -r requirements.txt
```

## Web3

If you want to connect to a localhost Web3 Provider, set the `ENVIRONMENT` var in the `.env` file to `development`. Confirm that the contract abi in `../contracts/contracts/build/contracts/Congo.json` matches the abi of your locally deployed contract.

Set `ENVIRONMENT` var in the `.env` file to `production` in order to connect to a Ropsten provider. Make sure `./contract.json` is up to date with the last deployed Ropsten contract abi


## Run

```bash
python3 main.py
```

The server will be available at `http://localhost:5000`

## API

### Search By Name

`GET /search?query={search-query}`

### Listings By Lister Email

`GET /user/listings?email={search-query}`

### Orders By Buyer Email

`GET /user/orders?email={search-query}`


## Deactivate venv

```bash
deactivate
```
