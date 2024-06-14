import  sqlite3, {Database} from "sqlite3";
import { open } from 'sqlite';
import fs from "fs";
import { decrypt, encrypt } from "./crypt";


const dbFile = "local.db";

export interface VaultEntry {
    name: string;
    email?: string;
    password?: string;
    url?: string;
};

function checkDBFileExists(): boolean {
    return fs.existsSync(dbFile);
}

async function openDb() {

    const dbExists = checkDBFileExists();
    if(!dbExists) {
        fs.writeFileSync(dbFile, "");
        try {

            //init db and files
            const db = await open({
                filename: dbFile,
                driver: sqlite3.Database
            });

            await db.exec(`
                CREATE TABLE IF NOT EXISTS vault_entries (
                    name TEXT NOT NULL,
                    email TEXT,
                    password TEXT,
                    url TEXT
                );
            `);

        } catch(err) {
            console.error(err);
        }
    }

    const dbPromise = open({
        filename: dbFile,
        driver: sqlite3.Database
    });

    return dbPromise;
}

async function saveToVault(entry: VaultEntry, masterPass: string) {
    const db = await openDb();
    const entryExists = await entryAlreadyExists(entry.name, db);
    if(entryExists) {
        throw Error(`Entry with name ${entry.name} already exists in vault`);
    }

    const sql = `
        INSERT INTO vault_entries (name, email, password, url)
        VALUES (? , ?, ?, ?)
    `;

    let p = entry.password;
    if(entry.password) {
        p = encrypt(masterPass, p);
    }

    await db.run(sql, [entry.name, entry.email, p, entry.url]);

    db.close();
}

async function entryAlreadyExists(name: string, db: any): Promise<boolean> {
    const sql = `SELECT EXISTS(SELECT 1 FROM vault_entries WHERE name = ?)`;

    const result = await db.get(sql, name);
    return result["EXISTS(SELECT 1 FROM vault_entries WHERE name = ?)"] === 1;
}

async function readFromVault(name: string, masterPass: string): Promise<VaultEntry> {
    const db = await openDb();
    const sql = `SELECT * from vault_entries WHERE name = ?`;

    const result = await db.get(sql, name) as VaultEntry;
    if(result.password !== "" || result.password !== undefined) {
        result.password = decrypt(masterPass, result.password);
    }

    return result;
}

async function removeFromVault(name: string) {
    const db = await openDb();
    const sql = `DELETE FROM vault_entries WHERE name = ?`;

    await db.run(sql, [name]);
    db.close();
    return;
}

async function listEntries() : Promise<string[]>{
    const db = await openDb();

    const sql = `SELECT name FROM vault_entries`;
    const rows = await db.all(sql, []);
    db.close();
    return rows.map(r => r.name);
}

export const vault = {
    "saveToVault": saveToVault,
    "readFromVault": readFromVault,
    "listEntries": listEntries,
    "removeFromVault": removeFromVault
};



