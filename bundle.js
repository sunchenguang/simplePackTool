
        (
            function(modules) {
                function require(id) {
                    const module = {exports: {}}
                    modules[id](module, module.exports, require)
                    return module.exports
                }
                require('./a.js')
            }
        
        )({
            './a.js': function (module, exports, require) {"use strict";

var _b = require("./b.js");

var _b2 = _interopRequireDefault(_b);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var a = 'i am a';
console.log(a, _b2.default);},
        
            './b.js': function (module, exports, require) {"use strict";

var b = 'i am b';
console.log(b);

module.exports = b;},
        })
    