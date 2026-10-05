/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, expect */

const path = require('path');
const ts = require('typescript');

/**
 * [CMCTY] The declarations match what the helpers return. The fixtures under
 * `typings/` are compiled (strict) against `src/index.d.ts`.
 */
describe('[CMCTY] typings', function () {
  this.timeout(60000);

  function compile (fixture) {
    const file = path.join(__dirname, 'typings', fixture);
    const program = ts.createProgram([path.join(__dirname, '../src/index.d.ts'), file], {
      noEmit: true,
      strict: true,
      skipLibCheck: true,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.Node10,
      lib: ['lib.es2022.d.ts'],
      types: []
    });
    return ts.getPreEmitDiagnostics(program)
      .filter((d) => d.file != null && path.resolve(d.file.fileName) === file)
      .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'));
  }

  it('[CMCTY1] RelationshipRecord: counterparty includes the legacy { apiEndpoint } form; withdrawal `by` accepts known and later values', function () {
    expect(compile('relationshipRecord.ts')).to.deep.equal([]);
  });
});
