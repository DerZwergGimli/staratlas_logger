# StarAtlas GM Logger

This tool is used to log tx from the StarAtlasGM to a MongoDB Database.

## Deployment
1. `git clone [this-repo]`
2. `cp docker-compose.yaml.sample docker-compose.yaml`
3. Edit the file `docker-compose.yaml`
   1. Paste the `MONGOURL` which should be the MongoDB instance url containing a user+password+url
4. `docker-compose up -d`


## Development
1. `npm install`
2. `npm run app`