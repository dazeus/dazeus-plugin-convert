# Convert command for DaZeus
This plugin allows you to convert items in one format to another format.

## Available commands

    }convert [x] to [y]

Convert some unit to some other unit

    }unit [x]

Determine the unit/definition of the given expression

    }unit [x] is [definition]

Create a new unit

    }nounit [x]

Remove a definition

## Installing it

    npm install dazeus-plugin-convert

Make sure you have gnu units installed on your system as well, and make it available on your path.
Alternatively you could provide the path to units using a command line option.

## Running it
To let this command run, simple execute this command in the root folder of the plugin

    node index

Several options are available, see the command line documentation for that:

    node index --help
