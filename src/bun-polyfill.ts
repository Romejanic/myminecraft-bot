// this is an awful hack but i need to either figure out how to compile bun
// on my hardware or move it to aws or something
import * as crypto from "crypto";

class CryptoHasher {
    private _hash: crypto.Hash;

    constructor(algorithm: string) {
        this._hash = crypto.createHash(algorithm);
    }

    update(data: string) {
        this._hash.update(data);
    }

    digest(format: crypto.BinaryToTextEncoding) {
        return this._hash.digest(format);
    }
}

const Bun = {
    CryptoHasher,
    version: process.version,
    env: process.env
};

export default Bun;
