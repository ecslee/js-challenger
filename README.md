# js-challenger

This project takes code input, parses it, and compares the result to a set of requirements.

## Running

The parser is served by node.
In the top level of this project, run `node app` to start the server.
Then proceed to `localhost:3000` in your browser of choice.

## Requirements

When setting up a coding exercise with this project, you can define three sets of requirements (or qualifications) for the code.  I've included samples in `require_main`.

### Categories

| Type | Description |
|------|-------------|
| Whitelist | A list of node types that must be included |
| Blacklist | A list of node types that must not be included |
| Structure | A list of node types that will be nested within each other, with the parent first, and deepest node last. |

### Format

Nodes are listed in an array.  Node types are taken from the [Mozilla Parser API](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API), which Acorn inherits.  Examples incude `'ForStatement'`, `'VariableDeclaration'`, `'ReturnStatement'`, etc.

## Acorn JS Parser

### Why

Javscript parsing is handled by [Acorn](http://marijnhaverbeke.nl/acorn/).

I chose Acorn over Esprima because I noticed more documentation on [Github](https://github.com/ternjs/acorn), and the parsed objects seemed to include more info, such as character locations.  (I didn't end up using this info in the project, but it seemed useful for any expansions.)

I ran some simple time trials between the two parsers, and although Esprima was faster on large code (e.g. jQuery), the performance was similar on smaller code (e.g. the code a student might write for a Khan exercise).

### How

The parser runs once per second, asynchronously to be unnoticed by the person typing.

If Acorn successfully parses the code, the result will be compared to the requirements.  The requirements panel will be updated with icons when requirements are met/not met.

If there is an error in the code, it is kept silent for now, assuming that most parsing errors will be due to code being grabbed while the person is in the middle of typing.