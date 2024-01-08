"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncMain = exports.Multicall2 = exports.IERC20 = void 0;
/**
 * ABI
 */
const IERC20_json_1 = __importDefault(require("./IERC20.json"));
const Multicall2_json_1 = __importDefault(require("./Multicall2.json"));
const SyncMain_json_1 = __importDefault(require("./SyncMain.json"));
exports.IERC20 = IERC20_json_1.default;
exports.Multicall2 = Multicall2_json_1.default;
exports.SyncMain = SyncMain_json_1.default;
