[![Travis Build Status](https://img.shields.io/travis/indatawetrust/reporter.svg)](https://travis-ci.org/indatawetrust/reporter)

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

##### demo
```
reporter --site https://news.ycombinator.com/news?p= --list .athing --link .storylink --title .storylink --limit 21
```

![gif](https://media.giphy.com/media/3og0IwHbwwflVbaVtm/giphy.gif)
