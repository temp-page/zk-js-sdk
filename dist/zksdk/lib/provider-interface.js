"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncProvider = void 0;
const utils_1 = require("./utils");
class SyncProvider {
    constructor() {
        // For HTTP provider
        this.pollIntervalMilliSecs = 1000;
    }
    async updateTokenSet() {
        const updatedTokenSet = new utils_1.TokenSet(await this.getTokens());
        this.tokenSet = updatedTokenSet;
    }
    async getTokenSymbol(token) {
        if ((0, utils_1.isNFT)(token)) {
            const nft = await this.getNFT(token);
            return nft.symbol || `NFT-${token}`;
        }
        return this.tokenSet.resolveTokenSymbol(token);
    }
    async disconnect() {
    }
}
exports.SyncProvider = SyncProvider;
