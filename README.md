[![Travis Build Status](https://img.shields.io/travis/indatawetrust/reporter.svg)](https://travis-ci.org/indatawetrust/reporter)

![img](https://nodei.co/npm/reporter-cli.png?downloads=true)

```
npm i -g reporter-cli
```

##### -- site

Pagination url

example: https://news.ycombinator.com/news?p=

##### -- list

list element selector

##### -- link

link element selector

##### -- title

title element selector

##### -- limit

page limit number

##### -- file

output filename

##### -- start

crawl start page

##### -- end

crawl end page

##### -- special

```
<key>: <selector>*<attribute>, <key>: <selector>*<attribute>..
```

```js
--special 'username: >.hnuser*text, score: >.score*text'
```

###### ^

parent element

###### <

previous sibling element

###### >

next sibling element

##### -- heartbeat.js

function to run after each request

example:

```js
module.exports = item => {
  console.log(item.url, item.title)
}
```

##### demo
```
reporter --site https://news.ycombinator.com/news?p= 
         --list .athing
         --link .storylink
         --title .storylink
         --limit 10
         --special 'username: >.hnuser*text, score: >.score*text'
```
