"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var http = require("http");
var qs = require("querystring");
var UrlPattern = require("url-pattern");
var util_1 = require("util");
var stream_1 = require("stream");
exports.server = function () { return new HttpServer(); };
exports.response = function (options) {
    if (options === void 0) { options = {}; }
    return new HttpResponse(options);
};
var HttpServer = /** @class */ (function () {
    function HttpServer() {
        this.listen = listen.bind(this);
        this.close = close.bind(this);
        this.port = port.bind(this);
        this.route = route.bind(this);
        this.middlewares = {
            GET: [],
            PUT: [],
            POST: [],
            PATCH: [],
            DELETE: [],
        };
    }
    return HttpServer;
}());
/**
 * Create an Http Server and start listening for requests
 * Bound as a method to `HttpServer`
 */
function listen(port) {
    var _this = this;
    if (port === void 0) { port = 0; }
    this._server = http.createServer(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var url, method, headers, _a, path, querystring, body, query, meta, request, _i, _b, m, match, response_1, adaptable, notFoundResponse, e_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 6, , 7]);
                    url = req.url, method = req.method, headers = req.headers;
                    _a = url.split('?'), path = _a[0], querystring = _a[1];
                    return [4 /*yield*/, asyncBody(req)];
                case 1:
                    body = _c.sent();
                    query = Object.assign({}, qs.decode(querystring));
                    // Try to parse JSON data
                    if (headers['content-type'] == 'application/json') {
                        try {
                            body = JSON.parse(body);
                        }
                        catch (e) { }
                    }
                    // Try to parse URL-Encoded data
                    else if (headers['content-type'] == 'application/x-www-form-urlencoded') {
                        body = Object.assign({}, qs.decode(body));
                    }
                    meta = {};
                    request = {
                        url: url,
                        method: method,
                        query: query,
                        headers: headers,
                        body: body,
                    };
                    _i = 0, _b = this.middlewares[method];
                    _c.label = 2;
                case 2:
                    if (!(_i < _b.length)) return [3 /*break*/, 5];
                    m = _b[_i];
                    match = void 0;
                    try {
                        // Some urlpatterns will throw errors
                        match = m.match(path);
                    }
                    catch (e) {
                        return [3 /*break*/, 4];
                    }
                    if (!match) return [3 /*break*/, 4];
                    request.params = match;
                    return [4 /*yield*/, m.handler(request, meta)];
                case 3:
                    response_1 = _c.sent();
                    if (response_1) {
                        adaptable = responseShorthand(response_1);
                        return [2 /*return*/, adaptResponse(adaptable, res)];
                    }
                    _c.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    notFoundResponse = exports.response({ status: 404 });
                    adaptResponse(notFoundResponse, res);
                    return [3 /*break*/, 7];
                case 6:
                    e_1 = _c.sent();
                    throw e_1;
                case 7: return [2 /*return*/];
            }
        });
    }); });
    this._server.listen(port);
}
/**
 * Stop listening for http requests
 * Bound as a method to  `HttpServer`
 */
function close() {
    this._server.close();
}
/**
 * Determine the port that's being listened over
 * Bound as a method to  `HttpServer`
 */
function port() {
    return this._server.address().port;
}
/**
 * Adapts `HttpResponse` it to its lower level counterpart`http.ServerResponse`.
 * A helper function of `HttpServer.listen()`
 */
function adaptResponse(input, output) {
    var status = input.status, headers = input.headers, body = input.body;
    if (!(body instanceof stream_1.Readable))
        headers['Content-Length'] = Buffer.byteLength(body);
    output.writeHead(status, __assign({}, headers));
    if (body instanceof stream_1.Readable) {
        body.pipe(output);
    }
    else {
        output.end(body);
    }
}
/**
 * Get stringified request body asyncronously
 * @param {http.IncomingMessage} req
 * @returns {Promise<string>}
 */
var asyncBody = util_1.promisify(function (req, callback) {
    var body = '';
    req.on('data', function (chunk) {
        body += chunk.toString();
    });
    req.on('end', function () {
        callback(null, body);
    });
    req.on('error', function (e) {
        callback(e);
    });
});
/**
 * Convert primitive response types into intances of `HttpResponse`
 * A helper function of `HttpServer.start()`
 * A helper function of `HttpServer.listen()`
 */
function responseShorthand(response) {
    if (typeof response == 'string') {
        return {
            status: 200,
            headers: { 'content-type': 'text/html' },
            body: response
        };
    }
    else if (typeof response == 'number' && statusMessages[response]) {
        return {
            status: response,
            headers: { 'content-type': 'text/plain' },
            body: statusMessages[response]
        };
    }
    else if (response instanceof stream_1.Readable) {
        return { status: 200, body: response };
    }
    else if (typeof response == 'object' && !(response instanceof HttpResponse)) {
        return {
            status: 200,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(response),
        };
    }
    else
        return response;
}
var Middleware = /** @class */ (function () {
    function Middleware(method, urlpattern, handler) {
        this.method = method;
        this.urlpattern = urlpattern;
        this.handler = handler;
        this.match = function (url) { return new UrlPattern(urlpattern).match(url); };
    }
    return Middleware;
}());
function route(method, urlpattern, handler) {
    method = method.toUpperCase();
    if (!exports.methods[method])
        throw new Error("Unsupported verb \"" + method + "\".");
    this.middlewares[method].push(new Middleware(method, urlpattern, handler));
}
var HttpResponse = /** @class */ (function () {
    function HttpResponse(options) {
        var status = options.status, headers = options.headers, body = options.body;
        this.status = status ? status : 200;
        this.headers = headers ? headers : {};
        this.body = body != undefined ? body : '';
    }
    return HttpResponse;
}());
var statusMessages = {
    200: 'OK',
    201: 'Created',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    500: 'Internal Server Error',
};
exports.methods = {
    GET: 'GET',
    PUT: 'PUT',
    POST: 'POST',
    DELETE: 'DELETE'
};
//# sourceMappingURL=http.js.map