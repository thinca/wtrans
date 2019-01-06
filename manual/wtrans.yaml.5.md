WTRANS.YAML 5 "NOVEMBER 2017"
=======================================

NAME
----

wtrans.yaml - Configuration file for wtrans command

SYNOPSIS
--------

`$WTRANS_CONFIG`, `$XDG_CONFIG_HOME/wtrans/wtrans.yaml`, `$HOME/.wtrans.yaml`

DESCRIPTION
-----------

wtrans(1) needs a configuration file.

`wtrans.yaml` is a YAML format file.

ENTRIES
-------

defaults.service
  A service name to used as default.

defaults.singlebyteLanguage
  This is used as source text language when `--from-lang` is omitted and source text only contains singlebyte characters.

defaults.multibyteLanguage
  This is used as source text language when `--from-lang` is omitted and source text contains multibyte characters.

defaults.toLanguageCandidates
  This is an array of languages.
  If `--to-lang` is omitted, the first one that is not source text language is used as result text language.

services
  This is an object.
  Key is name of service and value is definition of service.

services.&lt;name&gt;.url
  URL of this service.

services.&lt;name&gt;.requestFilters.acceptURLPattern
  Regexp pattern of URLs to accept.
  When this value is specified, URLs that doesn't match to this pattern are rejected.

services.&lt;name&gt;.requestFilters.ignoreURLPattern
  Regexp pattern of URLs to ignore.
  When this value is specified, URLs that matches to this pattern are rejected.

services.&lt;name&gt;.ajax
  Boolean.
  When true, this program waits for result node has changed.
  When false, this program waits for new page has loaded.

services.&lt;name&gt;.sourceNodeSelector
  CSS selector to specify source text.

services.&lt;name&gt;.resultNodeSelector
  CSS selector to specify result text.

services.&lt;name&gt;.resultContainerSelector
  CSS selector to specify result container.
  When ajax is true and result text node is appeared after translation,
  you need to set this option to watch the results appear.

services.&lt;name&gt;.ignoreResultXPath
  When on ajax mode, this program waits for result node has changed.
  Sometimes the result node changes in "during translate".
  The result is ignored when the node is found by this XPath.

services.&lt;name&gt;.actions.\*
  An array of actions on specific scene.

  ```
  - click: '#execute'
  - select: ['#lang', 'ja']
  ```

  Key is the action name and value is its parameter.
  Each actions must contains a single action.
  Actions are following:

  - click: 'selector'
  - select: ['selector', 'select-value']

services.&lt;name&gt;.actions.startup
  This is executed on the page is opened.

services.&lt;name&gt;.actions.from\_&lt;lang&gt;
  This is executed to select source language.
  `<lang>` is a language to select.

services.&lt;name&gt;.actions.to\_&lt;lang&gt;
  This is executed to select result language.
  `<lang>` is a language to select.

services.&lt;name&gt;.actions.from\_&lt;from-lang&gt;\_to\_&lt;to-lang&gt;
  This is executed to source and select result language.
  `<from-lang>` and `<to-lang>` are languages to select.

services.&lt;name&gt;.actions.execute
  This is executed to execute translation.

services.&lt;name&gt;.actions.execute\_from\_&lt;from-lang&gt;\_to\_&lt;to-lang&gt;
  This is executed to execute translation.

SERVICE
-------

Here is a sequence for translation.

1. Opens `url`.
2. Executes `startup` action if it exists.
3. To translate:
    1. Selects a languages:
        1. Executes `from_<from-lang>_to_<to-lang>` action if it exists.
        2. Otherwise, executes `from_<from-lang>` and `to_<to-lang>` each actions if it exists.
    2. Inputs a source text to `sourceNodeSelector` textarea.
    3. Executes translation:
        1. Executes `execute_from_<from-lang>_to_<to-lang>` action if it exists.
        2. Otherwise, executes `execute` action.
    4. Waits and gets the result from `resultNodeSelector`.

AUTHOR
------

thinca <thinca@gmail.com>

SEE ALSO
--------

wtrans(1), [Project Repository](https://github.com/thinca/wtrans)
