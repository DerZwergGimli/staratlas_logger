[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)
[![deploy](https://github.com/DerZwergGimli/staratlas_logger/actions/workflows/docker-image.yml/badge.svg)](https://github.com/DerZwergGimli/staratlas_logger/actions/workflows/docker-image.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![badge_docker_pulls](https://badgen.net/docker/pulls/derzwerggimli/staratlas-logger)
![badge_docker_size](https://badgen.net/docker/size/derzwerggimli/staratlas-logger)

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