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
exports.studentauth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModal_1 = __importDefault(require("../modal/userModal"));
const studentauth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "student") {
            res.status(403).json({ message: "Access denied for non-student" });
            return;
        }
        const userId = decoded.id;
        const user = yield userModal_1.default.findById(userId);
        if (!user) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        // if (user.isBlocked) {
        //   return res.status(403).json({ message: "User is blocked", accountType: "user" });
        // }
        next();
    }
    catch (error) {
        res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
        return;
    }
});
exports.studentauth = studentauth;
