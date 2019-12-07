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
var URLSearchParams = require('url').URLSearchParams;
var http = require("./http");
var _a = http.methods, GET = _a.GET, POST = _a.POST;
var fetch = require("node-fetch");
exports.tests = [
    portZeroTest,
    defaultHeadersTest,
    handlerMetaTest,
    illegalRouteMethodsTest,
    requestBodyParserURLencodedTest,
    requestBodyParserJsonTest,
    requestUrlTest,
    requestQueryTest,
    requestRedirectTest,
    defaultBodyTest,
    responseShortHandTest,
    partialMatchTest,
    asyncHandlerTest,
    nullBodyTest,
];
function portZeroTest() {
    return __awaiter(this, void 0, void 0, function () {
        var description, requests, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    description = "port 0 can be used to\n  guarantee an available port";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    requests = http.server();
                    return [4 /*yield*/, requests.listen()];
                case 2:
                    _a.sent();
                    assert_1.strict(requests.port());
                    return [4 /*yield*/, requests.close()];
                case 3:
                    _a.sent();
                    return [2 /*return*/, true];
                case 4:
                    e_1 = _a.sent();
                    return [2 /*return*/, e_1];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function defaultHeadersTest() {
    return __awaiter(this, void 0, void 0, function () {
        var description, requests, res, length_1, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    description = "Server responses should specify certain\n  headers by default";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    requests = http.server();
                    requests.route(GET, '/', function (req, meta) {
                        return http.response({
                            status: 200,
                            headers: {},
                            body: ''
                        });
                    });
                    return [4 /*yield*/, requests.listen()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + requests.port())];
                case 3:
                    res = _a.sent();
                    assert_1.strict.equal(res.status, 200);
                    length_1 = Object.keys(res.headers.raw()).length;
                    assert_1.strict.equal(length_1, 3);
                    assert_1.strict.ok(res.headers.get('date'));
                    assert_1.strict.ok(res.headers.get('content-length'));
                    assert_1.strict.equal(res.headers.get('connection'), 'close');
                    return [4 /*yield*/, requests.close()];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    e_2 = _a.sent();
                    return [2 /*return*/, e_2];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function handlerMetaTest() {
    return __awaiter(this, void 0, void 0, function () {
        var description, requests, res, _a, _b, e_3;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    description = "Request handlers should be able \n  to set metafields that are accessible to later handlers";
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, , 7]);
                    requests = http.server();
                    requests.route(GET, '/', function (req, meta) {
                        meta.desire = 'love';
                    });
                    requests.route(GET, '/', function (req, meta) {
                        return http.response({
                            status: 200,
                            headers: {},
                            body: 'Wilber didn\'t want food. He wanted ' + meta.desire,
                        });
                    });
                    return [4 /*yield*/, requests.listen()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + requests.port())];
                case 3:
                    res = _c.sent();
                    assert_1.strict.equal(res.status, 200);
                    _b = (_a = assert_1.strict).equal;
                    return [4 /*yield*/, res.text()];
                case 4:
                    _b.apply(_a, [_c.sent(), 'Wilber didn\'t want food. He wanted love']);
                    return [4 /*yield*/, requests.close()];
                case 5:
                    _c.sent();
                    return [3 /*break*/, 7];
                case 6:
                    e_3 = _c.sent();
                    return [2 /*return*/, e_3];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function illegalRouteMethodsTest() {
    return __awaiter(this, void 0, void 0, function () {
        var description, registerIllegalRoute;
        return __generator(this, function (_a) {
            description = "Registering Unsupported \n  request methods should throw an error";
            try {
                registerIllegalRoute = function () {
                    var requests = http.server();
                    requests.route('SAVE', '/', function (req, meta) {
                        return http.response();
                    });
                };
                assert_1.strict.throws(registerIllegalRoute, {
                    message: 'Unsupported verb "SAVE".'
                });
            }
            catch (e) {
                return [2 /*return*/, e];
            }
            return [2 /*return*/];
        });
    });
}
function requestBodyParserURLencodedTest() {
    return __awaiter(this, void 0, void 0, function () {
        var description, requests, params, e_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    description = "URL encoded body content\n  will be parsed into an object";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    requests = http.server();
                    requests.route(POST, '/', function (req, meta) {
                        assert_1.strict.equal(typeof req.body, 'object');
                        assert_1.strict.deepEqual({ name: 'charlotte' }, req.body);
                    });
                    return [4 /*yield*/, requests.listen()];
                case 2:
                    _a.sent();
                    params = new URLSearchParams();
                    params.append('name', 'charlotte');
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + requests.port(), {
                            method: 'POST',
                            headers: {
                                'content-type': 'application/x-www-form-urlencoded'
                            },
                            body: params,
                        })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, requests.close()];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    e_4 = _a.sent();
                    return [2 /*return*/, e_4];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function requestBodyParserJsonTest() {
    return __awaiter(this, void 0, void 0, function () {
        var description, requests, res, e_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    description = "JSON encoded body content\n  will be parsed into an object";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    requests = http.server();
                    requests.route(POST, '/', function (req, meta) {
                        assert_1.strict.equal(typeof req.body, 'object');
                        assert_1.strict.deepEqual({ name: 'wilbur' }, req.body);
                    });
                    return [4 /*yield*/, requests.listen()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + requests.port(), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: 'wilbur' }),
                        })];
                case 3:
                    res = _a.sent();
                    return [4 /*yield*/, requests.close()];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    e_5 = _a.sent();
                    return [2 /*return*/, e_5];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function requestUrlTest() {
    return __awaiter(this, void 0, void 0, function () {
        var description, requests, e_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    description = "Requests should have\n  a url property";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    requests = http.server();
                    requests.route(GET, '/', function (req, meta) {
                        assert_1.strict.equal(req.url, '/?idea=special');
                    });
                    return [4 /*yield*/, requests.listen()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + requests.port() + "/?idea=special")];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, requests.close()];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    e_6 = _a.sent();
                    return [2 /*return*/, e_6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function requestQueryTest() {
    return __awaiter(this, void 0, void 0, function () {
        var description, requests, e_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    description = "Requests should have\n  a query property that represents querystring\n  parameters";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    requests = http.server();
                    requests.route('GET', '/thinking', function (req, meta) {
                        // query is a null-prototype object, so deepEqual doesn't work as one might expect
                        assert_1.strict.equal(JSON.stringify(req.query), JSON.stringify({ splish: 'splash' }));
                    });
                    requests.route('GET', '/everything/was', function (req, meta) {
                        assert_1.strict.equal(JSON.stringify(req.query), JSON.stringify({ i: 'was', taking: 'a bath' }));
                    });
                    requests.route('GET', '/alright', function (req, meta) {
                        assert_1.strict.equal(JSON.stringify(req.query), JSON.stringify({ long: 'about', 'a saturday': 'night' }));
                    });
                    return [4 /*yield*/, requests.listen()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + requests.port() + "/thinking?splish=splash")];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + requests.port() + "/everything/was?i=was&taking=a%20bath")];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + requests.port() + "/alright?long=about&a%20saturday=night")];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, requests.close()];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    e_7 = _a.sent();
                    return [2 /*return*/, e_7];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function requestRedirectTest() {
    return __awaiter(this, void 0, void 0, function () {
        var description, first, second_1, response, _a, _b, e_8;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    description = "Redirects should be possible\n  using a response constructor";
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 8, , 9]);
                    first = http.server();
                    second_1 = http.server();
                    first.route('GET', '/', function (req, meta) {
                        var location = "http://0.0.0.0:" + second_1.port();
                        return http.response({
                            status: 307,
                            headers: { location: location },
                            body: '',
                        });
                    });
                    second_1.route('GET', '/', function (req, meta) { return 'Success!'; });
                    return [4 /*yield*/, first.listen()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, second_1.listen()];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + first.port())];
                case 4:
                    response = _c.sent();
                    _b = (_a = assert_1.strict).equal;
                    return [4 /*yield*/, response.text()];
                case 5:
                    _b.apply(_a, [_c.sent(),
                        'Success!']);
                    return [4 /*yield*/, first.close()];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, second_1.close()];
                case 7:
                    _c.sent();
                    return [3 /*break*/, 9];
                case 8:
                    e_8 = _c.sent();
                    return [2 /*return*/, e_8];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function defaultBodyTest() {
    return __awaiter(this, void 0, void 0, function () {
        var description, requests, _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, e_9;
        return __generator(this, function (_0) {
            switch (_0.label) {
                case 0:
                    description = "If a response has a status but no\n  body, the status code message should be the body";
                    _0.label = 1;
                case 1:
                    _0.trys.push([1, 20, , 21]);
                    requests = http.server();
                    requests.route('GET', '/200', function (req, meta) { return 200; });
                    requests.route('GET', '/201', function (req, meta) { return 201; });
                    requests.route('GET', '/400', function (req, meta) { return 400; });
                    requests.route('GET', '/401', function (req, meta) { return 401; });
                    requests.route('GET', '/403', function (req, meta) { return 403; });
                    requests.route('GET', '/404', function (req, meta) { return 404; });
                    requests.route('GET', '/409', function (req, meta) { return 409; });
                    requests.route('GET', '/500', function (req, meta) { return 500; });
                    return [4 /*yield*/, requests.listen()];
                case 2:
                    _0.sent();
                    _b = (_a = assert_1.strict).equal;
                    _c = ['OK'];
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + requests.port() + "/200")];
                case 3: return [4 /*yield*/, (_0.sent()).text()];
                case 4:
                    _b.apply(_a, _c.concat([_0.sent()]));
                    _e = (_d = assert_1.strict).equal;
                    _f = ['Created'];
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + requests.port() + "/201")];
                case 5: return [4 /*yield*/, (_0.sent()).text()];
                case 6:
                    _e.apply(_d, _f.concat([_0.sent()]));
                    _h = (_g = assert_1.strict).equal;
                    _j = ['Bad Request'];
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + requests.port() + "/400")];
                case 7: return [4 /*yield*/, (_0.sent()).text()];
                case 8:
                    _h.apply(_g, _j.concat([_0.sent()]));
                    _l = (_k = assert_1.strict).equal;
                    _m = ['Unauthorized'];
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + requests.port() + "/401")];
                case 9: return [4 /*yield*/, (_0.sent()).text()];
                case 10:
                    _l.apply(_k, _m.concat([_0.sent()]));
                    _p = (_o = assert_1.strict).equal;
                    _q = ['Forbidden'];
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + requests.port() + "/403")];
                case 11: return [4 /*yield*/, (_0.sent()).text()];
                case 12:
                    _p.apply(_o, _q.concat([_0.sent()]));
                    _s = (_r = assert_1.strict).equal;
                    _t = ['Not Found'];
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + requests.port() + "/404")];
                case 13: return [4 /*yield*/, (_0.sent()).text()];
                case 14:
                    _s.apply(_r, _t.concat([_0.sent()]));
                    _v = (_u = assert_1.strict).equal;
                    _w = ['Conflict'];
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + requests.port() + "/409")];
                case 15: return [4 /*yield*/, (_0.sent()).text()];
                case 16:
                    _v.apply(_u, _w.concat([_0.sent()]));
                    _y = (_x = assert_1.strict).equal;
                    _z = ['Internal Server Error'];
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + requests.port() + "/500")];
                case 17: return [4 /*yield*/, (_0.sent()).text()];
                case 18:
                    _y.apply(_x, _z.concat([_0.sent()]));
                    return [4 /*yield*/, requests.close()];
                case 19:
                    _0.sent();
                    return [3 /*break*/, 21];
                case 20:
                    e_9 = _0.sent();
                    return [2 /*return*/, e_9];
                case 21: return [2 /*return*/];
            }
        });
    });
}
function responseShortHandTest() {
    return __awaiter(this, void 0, void 0, function () {
        var description, requests, _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, e_10;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    description = "Handlers can return status codes, strings,\n  and objects as a shortcut";
                    _o.label = 1;
                case 1:
                    _o.trys.push([1, 12, , 13]);
                    requests = http.server();
                    requests.route('GET', '/num', function (req, meta) { return 200; });
                    requests.route('GET', '/bad', function (req, meta) { return 400; });
                    requests.route('GET', '/str', function (req, meta) { return 'hello'; });
                    requests.route('GET', '/obj', function (req, meta) { return ({ data: 'success' }); });
                    return [4 /*yield*/, requests.listen()];
                case 2:
                    _o.sent();
                    _b = (_a = assert_1.strict).equal;
                    _c = ['OK'];
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + requests.port() + "/num")];
                case 3: return [4 /*yield*/, (_o.sent()).text()];
                case 4:
                    _b.apply(_a, _c.concat([_o.sent()]));
                    _e = (_d = assert_1.strict).equal;
                    _f = ['Bad Request'];
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + requests.port() + "/bad")];
                case 5: return [4 /*yield*/, (_o.sent()).text()];
                case 6:
                    _e.apply(_d, _f.concat([_o.sent()]));
                    _h = (_g = assert_1.strict).equal;
                    _j = ['hello'];
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + requests.port() + "/str")];
                case 7: return [4 /*yield*/, (_o.sent()).text()];
                case 8:
                    _h.apply(_g, _j.concat([_o.sent()]));
                    _l = (_k = assert_1.strict).deepEqual;
                    _m = [{ data: 'success' }];
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + requests.port() + "/obj")];
                case 9: return [4 /*yield*/, (_o.sent()).json()];
                case 10:
                    _l.apply(_k, _m.concat([_o.sent()]));
                    return [4 /*yield*/, requests.close()];
                case 11:
                    _o.sent();
                    return [3 /*break*/, 13];
                case 12:
                    e_10 = _o.sent();
                    return [2 /*return*/, e_10];
                case 13: return [2 /*return*/];
            }
        });
    });
}
function partialMatchTest() {
    return __awaiter(this, void 0, void 0, function () {
        var description, requests_1, triggerMalformedRoute, e_11;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    description = "Errors thrown by url matching\n  are caught, and the middleware that caused it is ignored";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    requests_1 = http.server();
                    // Notice the orphaned paren in the pattern
                    requests_1.route('GET', '/cache/set/:key)', function (req, meta) { return 200; });
                    return [4 /*yield*/, requests_1.listen()];
                case 2:
                    _a.sent();
                    triggerMalformedRoute = function () { return __awaiter(_this, void 0, void 0, function () {
                        var response;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, fetch("http://0.0.0.0:" + requests_1.port() + "/cache/set/hello")];
                                case 1:
                                    response = _a.sent();
                                    return [4 /*yield*/, requests_1.close()];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    return [4 /*yield*/, assert_1.strict.doesNotThrow(triggerMalformedRoute)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_11 = _a.sent();
                    return [2 /*return*/, e_11];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function asyncHandlerTest() {
    return __awaiter(this, void 0, void 0, function () {
        var description, requests, response, _a, _b, e_12;
        var _this = this;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    description = "Promises returned by Handlers should be\n  valid material for http responses";
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, , 7]);
                    requests = http.server();
                    requests.route('GET', '/*', function (req, meta) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, 'Hello!'];
                    }); }); });
                    return [4 /*yield*/, requests.listen()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + requests.port())];
                case 3:
                    response = _c.sent();
                    _b = (_a = assert_1.strict).equal;
                    return [4 /*yield*/, response.text()];
                case 4:
                    _b.apply(_a, [_c.sent(), 'Hello!']);
                    return [4 /*yield*/, requests.close()];
                case 5:
                    _c.sent();
                    return [3 /*break*/, 7];
                case 6:
                    e_12 = _c.sent();
                    return [2 /*return*/, e_12];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function nullBodyTest() {
    return __awaiter(this, void 0, void 0, function () {
        var description, requests, response, _a, _b, e_13;
        var _this = this;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    description = "Null body values\n  are valid response material";
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, , 7]);
                    requests = http.server();
                    requests.route('GET', '/*', function (req, meta) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, http.response({
                                    headers: { 'content-type': 'application/json' },
                                    body: JSON.stringify(null),
                                })];
                        });
                    }); });
                    return [4 /*yield*/, requests.listen()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, fetch("http://0.0.0.0:" + requests.port())];
                case 3:
                    response = _c.sent();
                    _b = (_a = assert_1.strict).deepEqual;
                    return [4 /*yield*/, response.json()];
                case 4:
                    _b.apply(_a, [_c.sent(), null]);
                    return [4 /*yield*/, requests.close()];
                case 5:
                    _c.sent();
                    return [3 /*break*/, 7];
                case 6:
                    e_13 = _c.sent();
                    return [2 /*return*/, e_13];
                case 7: return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=server.test.js.map