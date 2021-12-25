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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrendingGifs = void 0;
const errorUtils_1 = require("../utils/errorUtils");
const axios_1 = __importDefault(require("axios"));
const { TENOR_API_KEY } = process.env;
console.log("TENOR_API_KEY : ", TENOR_API_KEY);
function getTrendingGifs(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield axios_1.default.get(`https://g.tenor.com/v1/trending?key=${TENOR_API_KEY}&limit=${req.query.limit}`);
            console.log("data : ", data.data);
            res.status(200).json({
                success: true,
                data: data.data
            });
        }
        catch (err) {
            errorUtils_1.handleError(err, res);
        }
    });
}
exports.getTrendingGifs = getTrendingGifs;
//# sourceMappingURL=gif.controller.js.map