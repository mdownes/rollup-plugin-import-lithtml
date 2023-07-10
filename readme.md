### rollup-plugin-concat
A Rollup plugin to import lit-html from an external .html file. The plugin will automatically add all directive imports meaning the html file can just deal with the markup.

### Install

Using npm:

```npm install rollup-plugin-import-lithtml --save-dev```

### Basic Usage

Create a rollup.config.js configuration file and import the plugin:

```
import importLitHtml from 'rollup-plugin-import-lithtml';

export default {
    input: 'src/index.js',
    output: {
        file: 'bundle.js',
        format: 'esm'
    },
    plugins: [
         importLitHtml()
    ],
}
```
### Advanced Usage 

Create a rollup.config.js configuration file and import the plugin:

```
import importLitHtml from 'rollup-plugin-import-lithtml';

export default {
    input: 'src/index.js',
    output: {
        file: 'bundle.js',
        format: 'esm'
    },
    plugins: [
         importLitHtml({
            include: '**/*.html',
            directives: ['ifDefined', 'unsafeHTML','unsafeSVG', 'when','classMap']
        })
    ],
    //other plugins go here
}
```
You can manually specifiy which lit-html directives your HTML files use.


The configuration above will import a HTML file like the following:

**Test.html**
```
<style>
    .color{
        color:red;
    }
</style>
<div class=${classMap(this.classes)}>
    Hello, ${this.name}
</div>
```

The above HTML file would be imported from a JavaScript file similar to this:

**Test.js : lit-html**
```
import template from './test.html';
import {render} from 'lit';

let htm = template.call({name: 'Joe', classes:{color:true}});
render(htm, document.body);
```
**Test.js: Lit-Element web component**
```
import template from './test.html';
import { LitElement } from 'lit';
import { property, customElement } from 'lit/decorators.js';

@customElement('hello-world')
export class HelloWorld extends LitElement {
    @property()
    classes = { color: true };
    @property()
    name = 'Joe Bloggs';
    
    render() {
        return template.call(this);
    }
}


```
### Options


#### directives

Type: Array[directiveName : String] : Optional

Describes the list of directives to be imported, meaning that only the HTML need to go into the .HTML file.
(no imports).   
If not present, the plugin will import all directives.