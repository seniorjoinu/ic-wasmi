import {delay, getSecsNano, ISetup, makeSetup} from "./utils";
import {Ed25519KeyIdentity} from "@dfinity/identity";
import {assert} from 'chai';
import {deleteCanister, deployCanister} from "./deploy";
import fs from 'fs';

describe('wasm interpreter', () => {
    const userKey = Ed25519KeyIdentity.generate();

    let user: ISetup;

    before(async () => {
        await deployCanister();

        user = await makeSetup(userKey)

        await user.agent.fetchRootKey();
    });

    after(async () => {
        await deleteCanister();
    });

    it("modules execute well", async () => {

        // ADDING NUMBERS
        const addModule: Buffer = fs.readFileSync("./src/add.wasm");

        await user.interpreterClient.set_module([...addModule]);
        const addResult = await user.interpreterClient.execute([5, 3]);
        assert.equal(addResult[0], 8);

        // SUBTRACTING NUMBERS
        const subModule: Buffer = fs.readFileSync("./src/sub.wasm");

        await user.interpreterClient.set_module([...subModule]);
        const subResult = await user.interpreterClient.execute([5, 3]);
        assert.equal(subResult[0], 2);

        // MULTIPLYING NUMBERS
        const mulModule: Buffer = fs.readFileSync("./src/mul.wasm");

        await user.interpreterClient.set_module([...mulModule]);
        const mulResult = await user.interpreterClient.execute([5, 3]);
        assert.equal(mulResult[0], 15);
    });
});