'use strict';

if (process.env.NODE_ENV === "production") {
  module.exports = require("./pyramid-game-lib.cjs.prod.js");
} else {
  module.exports = require("./pyramid-game-lib.cjs.dev.js");
}
