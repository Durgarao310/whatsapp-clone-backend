"use strict";
// filepath: src/helpers/asyncatch.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncatch = asyncatch;
/**
 * asyncatch - Utility for concise async error handling.
 * Usage: const [result, err] = await asyncatch(promise);
 */
function asyncatch(promise) {
    return __awaiter(this, void 0, void 0, function* () {
        return promise.then(data => [data, null]).catch(err => [null, err]);
    });
}
