WTRANS 1 "NOVEMBER 2017"
=======================================

NAME
----

wtrans - A CLI tool to translate text via web translation service

SYNOPSIS
--------

`wtrans` [options] *text*

DESCRIPTION
-----------

`wtrans` takes a text from argument or stdin and translates it to another language.
This program uses headless GoogleChrome in background and translate texts via web service.

You must put a configuration file.  See FILES section and wtrans.yaml(5).

OPTIONS
-------

`-f`, `--from-lang` *lang*
  Langeage of source text.

`-t`, `--to-lang` *lang*
  Langeage of result text.

`-c`, `--config` *config-file*
  Use the alternate *config-file* instead of default file. This
  overrides `WTRANS_CONFIG` environment variable.

`-s`, `--service` *service*
  Service name.  Services are defined in wtrans.yaml(5).

`-i`, `--interactive`
  Enable interactive mode.

`--protocol` *progocol*
  Input and output format.  `text` or `json`.

`--list-services`
  Output all service names from config and exit.

`-h`, `--help`
  Output usage information.

FILES
-----

Windows: *%APPDATA%\wtrans\Config\wtrans.yaml*  
MacOS: *$HOME/Library/Preferences/wtrans/wtrans.yaml*  
Linux: *$XDG_CONFIG_HOME/wtrans/wtrans.yaml*  
*~/.wtrans.yaml*

  Per user configuration file. See wtrans.yaml(5) for further details.
  A file that found first is used.
  Overridden by the `--config` option and `WTRANS_CONFIG` environment variable.

ENVIRONMENT
-----------

`WTRANS_CONFIG`
  If non-empty the full pathname for an alternate per user configuration file.
  Overridden by the `--config` option.

PROTOCOL
--------

You can choose a protocol from `text` or `json` via `--protocol` option.

### text protocol
Input raw text and output raw text.  Simple.  Default.

### json protocol

Input a JSON text and output a JSON text.
JSON is form of JSON-RPC 2.0.
Here is a method list:

`translate`

  Translates a text.

  `Parameters:`

  - *sourceText*

    Input Text.

  - *fromLang*

    Langeage of input text.

    If omitted, it will be selected automatically by config.

  - *toLang*

    Langeage of result text.

    If omitted, it will be selected automatically by config.

  - *pageName*

    Page name to use.

    If omitted, `default.service` in config is used.
    If the page is not opened, it is opened automatically.

  `Return values:`

  - *resultText*

    Result text.

  - *sourceText*
  - *fromLang*
  - *toLang*
  - *pageName*

    Same as input.

`openPage`

  Opens a new page.

  `Parameters:`

  - *pageName*

    Name of opening page.  This is used in `translate` method and `closePage` method.

  - *service*

    One of following:

    1. Service name in config.
    2. A definition of service.  See wtrans.yaml(5) for detail of form.

`closePage`

  Closes a exist page.

  `Parameters:`

  - *pageName*

    Name of page to closing.


AUTHOR
------

thinca <thinca@gmail.com>

SEE ALSO
--------

wtrans.yaml(5), [Project Repository](https://github.com/thinca/wtrans)
