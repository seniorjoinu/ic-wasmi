import {execAsync} from "./utils";

export async function deployCanister() {
    const command = `dfx deploy on-chain-wasm-interpreter`;

    console.log('Deploying on-chain-wasm-interpreter...');
    console.log(command);
    console.log(await execAsync(command));
}

export async function deleteCanister() {
    const command = `dfx canister stop on-chain-wasm-interpreter && dfx canister delete on-chain-wasm-interpreter`;

    console.log(command);
    console.log(await execAsync(command));
}