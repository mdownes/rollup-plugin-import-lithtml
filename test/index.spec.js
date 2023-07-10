const importLitHtml = require('../index.js');
var fs = require('fs');
const path = require("path")
const code = fs.readFileSync(path.resolve(__dirname, './test.html'), 'utf8')

let mockCreateFilterValue = true;

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readdirSync: jest.fn()
}));

jest.mock('rollup-pluginutils', () => ({
  createFilter: jest.fn().mockReturnValue(() => mockCreateFilterValue) // Mock createFilter to always return a filter that includes all files
}));

describe('Rollup Plugin Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('transform function should return transformed code', async () => {
    mockCreateFilterValue = true;
   // const code = '<div>Hello, world!</div>';
    const id = 'example.html';
    const expectedTransformedCode = `\n\nimport { html } from 'lit'; export default function() { return html\`${code}\`; }`;

    const result = await importLitHtml({ cache: false }).transform(code, id);

    expect(result.code).toBe(expectedTransformedCode);
    expect(result.map).toEqual({ mappings: '' });
  });

  test('transform function should return null if filter condition is not met', async () => {
   // const code = '<div>Hello, world!</div>';
    const id = 'example.js';
    mockCreateFilterValue = false;
    const result = await importLitHtml({ cache: false }).transform(code, id);

    expect(result).toBeNull();
  });

  test('transform function should import directives based on options', async () => {
    mockCreateFilterValue = true;
    //const code = '<div>Hello, world!</div>';
    const id = 'example.html';
    const options = {
      directives: ['ifDefined', 'repeat'],
      include: '**/*.html',
      exclude: 'exclude.html',
      cache: false
    };
    const directiveFiles = ['if-defined.js', 'repeat.js', 'when.js', 'unsafe-html.js'];
    fs.readdirSync.mockReturnValue(directiveFiles);

    const expectedTransformedCode = `import { ifDefined } from 'lit-html/directives/if-defined.js';\nimport { repeat } from 'lit-html/directives/repeat.js';\n\nimport { html } from 'lit'; export default function() { return html\`${code}\`; }`;

    const result = await importLitHtml(options).transform(code, id);

    expect(result.code).toBe(expectedTransformedCode);
    expect(result.map).toEqual({ mappings: '' });
    expect(fs.readdirSync).toHaveBeenCalledWith(path.resolve('node_modules/lit-html/directives'));
  });

  test('transform function should import all directives if options.directives is not provided', async () => {
    mockCreateFilterValue = true;
   // const code = '<div>Hello, world!</div>';
    const id = 'example.html';

    const directiveFiles = ['if-defined.js', 'repeat.js', 'when.js'];
    fs.readdirSync.mockReturnValue(directiveFiles);

    const expectedTransformedCode = `import { ifDefined } from 'lit-html/directives/if-defined.js';\nimport { repeat } from 'lit-html/directives/repeat.js';\nimport { when } from 'lit-html/directives/when.js';\n\nimport { html } from 'lit'; export default function() { return html\`${code}\`; }`;

    const result = await importLitHtml({ cache: false }).transform(code, id);

    expect(result.code).toBe(expectedTransformedCode);
    expect(result.map).toEqual({ mappings: '' });
    expect(fs.readdirSync).toHaveBeenCalledWith(path.resolve('node_modules/lit-html/directives'));
  });
});
