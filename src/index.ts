#!/user/bin/env node

import { VaultEntry, vault } from "./vault";
import yargs from "yargs/yargs";
import {hideBin} from "yargs/helpers";
import {input} from "@inquirer/prompts";

import { getMasterPass } from "./utils";

const cli =  yargs(hideBin(process.argv));
cli.option('master-password', {
    type: 'string',
    describe: 'Master password for access. Must be included when saving and retrieving',
    demandOption: false
});

cli.command("save", "save a secret in the vault", async (yargs) => {
    console.log("save");

    const masterPass = getMasterPass(yargs);
    if(masterPass === "" || masterPass === undefined) {
        console.error("--master-password required to store data");
        process.exit(1);
    }

    const entry: VaultEntry = {
        name: ""
    };

    const name = await input({message: "secret name?"}) as string;
    if(name === "") {
        console.error("Name is a required field");
        process.exit();
    }

    entry.name = name;
    entry.email = await input({message: "account email or username?", default: ""}) as string;
    entry.password = await input({message: "account password (this will be encrypted)", default: ""}) as string;
    entry.url = await input({message: "URL of account?", default: ""}) as string;

    await vault.saveToVault(entry, masterPass);

    console.log(`${name} saved to local vault!`);
}).parse();

cli.command("get", "get a saved secrets info", async(yargs) => {
    const masterPass = getMasterPass(yargs);
    if(masterPass === "" || masterPass === undefined) {
        console.error("--master-password required to retrieve data");
        process.exit(1);
    }

    const name = await input({message: "name of secret to retrieve?"});
    const entry = await vault.readFromVault(name, masterPass);
    
    console.log(JSON.stringify(entry, null, 2));

}).parse();

cli.command("list", "list saved secrets", async(yargs) => {
    console.log("Secrets stored in vault: ");
    (await vault.listEntries()).forEach(e => console.log(e));
}).parse();

cli.command("remove", "delete a secret from the vault", async(yargs) => {
    const name = await input({message: "name of secret to remove?"});
    await vault.removeFromVault(name);

    console.log(`${name} removed from vault`);
}).parse();