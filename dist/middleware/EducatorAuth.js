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
exports.educatorauth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const educatorModal_1 = __importDefault(require("../modal/educatorModal"));
const educatorauth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "educator") {
            res.status(403).json({ message: "Access denied for non-educators" });
            return;
        }
        const educatorId = decoded.id;
        const educator = yield educatorModal_1.default.findById(educatorId);
        if (!educator) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        if (educator.isBlocked) {
            res.status(403).json({ message: "User is blocked", accountType: "user" });
            return;
        }
        next();
    }
    catch (error) {
        res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
        return;
    }
});
exports.educatorauth = educatorauth;
