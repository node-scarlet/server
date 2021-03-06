"use strict";
/**
 * A lightweight test runner
 */
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
var perf_hooks_1 = require("perf_hooks");
// Console Colors
var red = '\x1b[31m';
var green = '\x1b[32m';
var reset = '\x1b[0m';
// Return errors instead of throwing
function withoutThrowing(fn) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    resolve(fn());
                }).catch(function (error) { return error; })];
        });
    });
}
function runWithTimer(fn) {
    return __awaiter(this, void 0, void 0, function () {
        var startTime, result, endTime, runTime;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    startTime = perf_hooks_1.performance.now();
                    return [4 /*yield*/, withoutThrowing(fn)];
                case 1:
                    result = _a.sent();
                    endTime = perf_hooks_1.performance.now();
                    runTime = (endTime - startTime).toFixed(2);
                    if (result instanceof Error) {
                        console.error((fn.name || 'anonymous') + ": " + runTime + " ms " + red + "fail" + reset);
                        console.error('\n', result, '\n');
                        process.exit(1);
                    }
                    else
                        console.log((fn.name || 'anonymous') + ": " + runTime + " ms " + green + "ok" + reset);
                    return [2 /*return*/];
            }
        });
    });
}
// Extract test functions from a list of modules
function testSuite() {
    var modules = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        modules[_i] = arguments[_i];
    }
    return modules.reduce(function (included, m) {
        return included.concat(m.tests);
    }, []);
}
exports.testSuite = testSuite;
// A "test" is any function that throws an error to indicate failure
function run(tests) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            runWithTimer(function testSuite() {
                return __awaiter(this, void 0, void 0, function () {
                    var _i, tests_1, test;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _i = 0, tests_1 = tests;
                                _a.label = 1;
                            case 1:
                                if (!(_i < tests_1.length)) return [3 /*break*/, 4];
                                test = tests_1[_i];
                                return [4 /*yield*/, runWithTimer(test)];
                            case 2:
                                _a.sent();
                                _a.label = 3;
                            case 3:
                                _i++;
                                return [3 /*break*/, 1];
                            case 4: return [2 /*return*/];
                        }
                    });
                });
            });
            return [2 /*return*/];
        });
    });
}
exports.run = run;
//# sourceMappingURL=runner.js.map