
        (
            function(modules) {
                function require(id) {
                    const [fn, mapping] = modules[id]
                    //从mapping中拿出path对应的id
                    function localRequire(path) {
                        return require(mapping[path])
                    }
                  
                    const module = {exports: {}}
                    fn(module, module.exports, localRequire)
                    
                    return module.exports
                }
                require(0)
            }
        
        )({
            '0': [function (module, exports, require) {"use strict";

var _b = require("./b.js");

var _b2 = _interopRequireDefault(_b);

require("./test.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var a = 'i am a';
console.log(a, _b2.default);}, {"./b.js":1,"./test.css":2}],
        
            '1': [function (module, exports, require) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _c = require("./examples/c.js");

var _c2 = _interopRequireDefault(_c);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var b = 'i am b';
console.log(b);
exports.default = b + _c2.default;}, {"./examples/c.js":3}],
        
            '2': [function (module, exports, require) {
        const style = document.createElement('style')
        style.innerText = ".test {    color: red;}"
        document.head.appendChild(style)
    }, {}],
        
            '3': [function (module, exports, require) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _a = require("./a.js");

exports.default = _a.a + ' examples c';}, {"./a.js":4}],
        
            '4': [function (module, exports, require) {"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
console.log('examples a');
var a = exports.a = 'examples a';}, {}],
        })
    