var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var readFile = Promise.promisify(require('fs').readFile);
var writeFile = Promise.promisify(require('fs').writeFile);
var cheerio = require('cheerio');
var toMarkdown = require('to-markdown');


var md = toMarkdown('<h1>Hello world!</h1>');

var urls = ['https://developer.mozilla.org/en-US/docs/Web/HTML/Element/applet']

var promises = [];
for (var i = 0; i < urls.length; i++) {
  promises.push(request.getAsync(urls[i]));
}


Promise.all(promises).then(function(data){
  var parsed = JSON.parse(JSON.stringify(data));
  var $ = cheerio.load(parsed[0]['body']);
  var html = $('#wikiArticle').html();

  console.log(toMarkdown(html, {converters: [
    {
      filter: 'code',
      replacement: function(content) {
        return '`' + content + '`';
      }
    },
    {
      filter: function(node) {
        return node.className === "brush: html";
      },
      replacement: function (content) {
        return '```html' + '\n' + content + '\n' +'```';
      }
    },
    {
      filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],

      replacement: function(innerHTML, node) {
        var hLevel = node.tagName.charAt(1);
        var hPrefix = '';
        for(var i = 0; i < hLevel; i++) {
          hPrefix += '#';
        }
        return '\n' + hPrefix + ' ' + innerHTML + '\n\n';
      }
    }
  ]}))

  $('#wikiArticle').contents().each(function(){
    console.log($(this).text().trim())
  })

}).catch(function (err) {
  if(err)console.log(err);
})
