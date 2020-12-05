wtrans
======

[![NPM Version][npm-image]][npm-url]
[![Node.js Version][node-version-image]][node-version-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][codecov-image]][codecov-url]

A CLI tool to translate text via web translation service.

Requirements
------------

- Node.js v10.18.1+
  - This is required by [Puppeteer](https://pptr.dev/)

Installation
------------

Install it using [npm](https://www.npmjs.com/):

```
$ npm install -g wtrans
```

Synopsis
--------

First of all, you must write and put a config file.  See [wtrans.yaml manual](manual/wtrans.yaml.5.md) for detail.

```sh
# Translates argument text
$ wtrans Hello
こんにちは

# Translates stdin text
$ echo Hello | wtrans
こんにちは

# Detects input text language by its whether multibyte character or not
$ wtrans こんにちは
Hello
```

See also:

- [wtrans command manual](manual/wtrans.1.md)
- [wtrans.yaml manual](manual/wtrans.yaml.5.md)


License
-------

[zlib License](LICENSE.txt)

Author
------

thinca <thinca+npm@gmail.com>


[npm-image]: https://img.shields.io/npm/v/wtrans.svg
[npm-url]: https://npmjs.org/package/wtrans
[node-version-image]: https://img.shields.io/node/v/wtrans.svg
[node-version-url]: https://nodejs.org/en/download/
[travis-image]: https://travis-ci.com/thinca/wtrans.svg?branch=master
[travis-url]: https://travis-ci.com/thinca/wtrans
[codecov-image]: https://codecov.io/gh/thinca/wtrans/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/thinca/wtrans
