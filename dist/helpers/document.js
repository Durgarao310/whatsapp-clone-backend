"use strict";
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
exports.saveDoc = saveDoc;
// filepath: src/helpers/document.ts
/**
 * saveDoc - Utility to save a Mongoose document with asyncatch error handling.
 * Usage: const [saved, err] = await saveDoc(doc);
 */
const asyncatch_1 = require("./asyncatch");
function saveDoc(doc) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, asyncatch_1.asyncatch)(doc.save());
    });
}
