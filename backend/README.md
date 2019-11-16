# Running the Server

## Create .env
Create a file called `.env` with credentials in the following format:
```txt
ATLASUSER=usernameForMongo
ATLASPASS=passwordForMongo
```

## Activate venv
```bash
python3 -m venv env
source env/bin/activate
```

## Install requirements
```bash
pip install -r requirements.txt
```

## Run
```bash
python server.py
```

The server will be available at `http://localhost:5000`

## Deactivate venv
```bash
deactivate 
```

## API

### Search By Name
`GET /search?query={search-query}`

### Listings By Lister Email
`GET /user/listings?email={search-query}`

### Orders By Buyer Email
`GET /user/orders?email={search-query}`