const { createFilter } = require('rollup-pluginutils');
const fs = require('fs');
const path = require('path');

let cachedDirectives;

function getDirectives(options) {
  if (options.cache === true && cachedDirectives) {
    return cachedDirectives;
  }
  function camelToDashedCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  const directiveFiles = fs.readdirSync(path.resolve('node_modules/lit-html/directives'));

  if (directiveFiles) {
    cachedDirectives = directiveFiles
      .filter(
        (file) => {
          if (options.directives) {
            return options.directives.some(val => {
              return file.toLowerCase().endsWith(camelToDashedCase(val).toLowerCase() + '.js')
            })
          } else {
            return path.extname(file) === '.js' && file !== 'private-async-helpers.js'
          }
        })
      .map((file) => {
        const directiveFileName = path.basename(file, '.js');

        let directiveName = directiveFileName.replace(/-(\w)/g, (_, letter) => letter.toUpperCase());
        directiveName = directiveName.replace(/Svg/g, 'SVG').replace(/Html/g, 'HTML');

        const directiveFilePath = 'lit-html/directives/' + file;
        return {
          directiveName,
          directiveFilePath
        };
      });
  } else {
    cachedDirectives = [];
  }
  return cachedDirectives;

}

module.exports = function importLitHtml(options = {}) {
  const filter = createFilter(options.include || '**/*.html', options.exclude);
  const directives = Array.isArray(options.directives) ? options.directives : [];
  const cache = typeof options.cache !== 'undefined' ? options.cache : true;
  return {
    name: 'import-lithtml',

    async transform(code, id) {
      if (!filter(id)) {
        return null;
      }

      const allDirectives = directives.length > 0 ? getDirectives({ directives, cache }) : getDirectives({ cache });
      const importStatements = allDirectives.map((d) => {
        if (d.directiveFilePath) {
          return `import { ${d.directiveName} } from '${d.directiveFilePath}';`;
        }
        return null;
      }).filter(Boolean).join('\n');

      const importBlock = `${importStatements}\n\n`;
      const transformedCode = importBlock + `import { html } from 'lit'; export default function() { return html\`${code}\`; }`;

      return {
        code: transformedCode,
        map: { mappings: '' }
      };
    }
  };
};
