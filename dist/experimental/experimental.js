"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = require("assert");
var http = require("../http");
var GET = http.methods.GET;
var fetch = require("node-fetch");
var protect_1 = require("./protect");
var static_1 = require("./static");
exports.tests = [
    handlerOnErrorTest,
    staticFileTest,
];
function handlerOnErrorTest() {
    return __awaiter(this, void 0, void 0, function () {
        var description, asyncHandler, protectedAsyncHandler, requests, first, second, _a, _b, _c, _d, e_1;
        var _this = this;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    description = "Handlers can be wrapped\n  with uniform error handling";
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 9, , 10]);
                    asyncHandler = function (req, meta) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (req.query.fail)
                                throw new Error('unexpected behavior!');
                            return [2 /*return*/, 'Success!'];
                        });
                    }); };
                    return [4 /*yield*/, protect_1.protect(asyncHandler)];
                case 2:
                    protectedAsyncHandler = _e.sent();
                    requests = http.server();
                    requests.route(GET, '/*', protectedAsyncHandler);
                    return [4 /*yield*/, requests.listen()];
                case 3:
                    _e.sent();
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + requests.port() + "?fail=true")];
                case 4:
                    first = _e.sent();
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + requests.port())];
                case 5:
                    second = _e.sent();
                    _b = (_a = assert_1.strict).deepEqual;
                    return [4 /*yield*/, first.text()];
                case 6:
                    _b.apply(_a, [_e.sent(), 'Not Found']);
                    _d = (_c = assert_1.strict).deepEqual;
                    return [4 /*yield*/, second.text()];
                case 7:
                    _d.apply(_c, [_e.sent(), 'Success!']);
                    return [4 /*yield*/, requests.close()];
                case 8:
                    _e.sent();
                    return [3 /*break*/, 10];
                case 9:
                    e_1 = _e.sent();
                    return [2 /*return*/, e_1];
                case 10: return [2 /*return*/];
            }
        });
    });
}
function staticFileTest() {
    return __awaiter(this, void 0, void 0, function () {
        var description, requests, first, second, _a, _b, _c, _d, e_2;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    description = "Static files can be served\n  from a given directory";
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 8, , 9]);
                    requests = http.server();
                    requests.route(GET, '/*', static_1.staticFiles(__dirname + '/static'));
                    requests.route(GET, '/*', function () { return 404; });
                    return [4 /*yield*/, requests.listen()];
                case 2:
                    _e.sent();
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + requests.port() + "/index.html")];
                case 3:
                    first = _e.sent();
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + requests.port() + "/fake.html")];
                case 4:
                    second = _e.sent();
                    _b = (_a = assert_1.strict).deepEqual;
                    return [4 /*yield*/, first.text()];
                case 5:
                    _b.apply(_a, [_e.sent(), '<h1>Hello World!</h1>']);
                    _d = (_c = assert_1.strict).deepEqual;
                    return [4 /*yield*/, second.text()];
                case 6:
                    _d.apply(_c, [_e.sent(), 'Not Found']);
                    return [4 /*yield*/, requests.close()];
                case 7:
                    _e.sent();
                    return [3 /*break*/, 9];
                case 8:
                    e_2 = _e.sent();
                    return [2 /*return*/, e_2];
                case 9: return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=experimental.js.map