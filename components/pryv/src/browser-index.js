/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
// make lib available as `Pryv` (with capital P, deprecated) for backward-compatibility with apps importing via <script>
// TODO: remove deprecated alias with next major version
module.exports = global.Pryv = require('./index');
