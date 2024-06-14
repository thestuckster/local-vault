local-vault
===

Local vault is a small 1 day side project I started to get more familiar with Typescript

It creates a sqlite database to store and retrieve encrypted sensitive account information.


## Usage

Install npm deps with `npm install`

Right now, all the commands are in the package.json file and can be ran via npm. I didn't get around to making this a full fledged CLI program but whatevs.

the encryption relies on a master password passed to the program by a `--master-password` flag. Right now I have this hardcoded in the `package.json` file, so if you're running the commands via the npm scripts, it will always be `testing` unless otherwise changed

### Storing a secret

`npm run save` or `node dist/index.js save --master-password <yourPass>`

will prompt you with questions like the example below:
```
? secret name? my-secret
? account email or username? superSecret@fbi.gov
? account password (this will be encrypted boogerEater420
? URL of account? fbi.gov
my-secret saved to local vault!
```

### Retrieving a secret

`npm run get` or `node dist/index.js get --master-password <yourPass>`

Will ask you what secret you'd like retrieve and print the details out to the console in a json format

### Listing secrets

`npm run list` or `node dist/index.js list`

Will list all the currently stored secret names to the console, each on a new line

### Removeing a secret

`npm run remove` or `node dist/index.js remove` 

Will prompt you for the name of the secret you would like to remove and then delete it from the database.