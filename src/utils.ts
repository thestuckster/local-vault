import yargs from "yargs/yargs";

export function getMasterPass(yargs: any): string {
    const options = yargs.argv as any;
    return options['master-password'];
}