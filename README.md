# Stream-Deck-Font-Awesome

[![Generate Icons](https://github.com/teknogeek/Stream-Deck-Font-Awesome/actions/workflows/generate-icons.yaml/badge.svg)](https://github.com/teknogeek/Stream-Deck-Font-Awesome/actions/workflows/generate-icons.yaml)

I got tired of using old v4 Font Awesome icons on my Stream Deck, so I wrote this NodeJS script to generate the latest ones.

# Download
There is an automatic GitHub Action that generates the latest icons (white-on-black) every push and uploads it as an artifact. You can find the latest runs [here](https://github.com/teknogeek/Stream-Deck-Font-Awesome/actions/workflows/generate-icons.yaml).

# Usage

By default, this will generate a folder named `streamdeck-fontawesome-256` with every free icon drawn in White on Black background.

The script takes a variety of parameter inputs that let you customize how the icons are generated, and which ones to generate.

```sh
$ npm install
```

then

```
$ node generate-icons.js -h
Options:
  -h, --help              Show help                                    [boolean]
  -n, --icon-name         icon name                                     [string]
  -A, --all               generate all icons                           [boolean]
  -s, --icon-style        icon style
                                [string] [choices: "regular", "solid", "brands"]
  -b, --background-color  background color (hex)
                                         [string] [required] [default: "000000"]
  -i, --icon-color        icon color (hex)
                                         [string] [required] [default: "FFFFFF"]
  -z, --icon-size         icon size                      [number] [default: 256]
  -o, --output-path       output folder for icons, or output filename when used
                          with --icon-name. defaults to
                          ./streamdeck-fontawesome-{icon-size} or
                          ./{icon-name}.{icon-style}.png when used with
                          --icon-name                                   [string]
      --force             force output to overwrite any existing files [boolean]
```
# Examples

**Generate all white-on-black icons**
```sh
$ node generate-icons.js --all
Generating 0.solid.png...
Generating 1.solid.png...
Generating 2.solid.png...
Generating 3.solid.png...
Generating 4.solid.png...
Generating 5.solid.png...
Generating 6.solid.png...
Generating 7.solid.png...
Generating 8.solid.png...
...
```

![example](examples/example.png)


**Generate a purple Twitch icon**
```sh
$ node generate-icons.js --icon-name twitch --icon-color 9146FF -o twitch.purple.png
Generating twitch.purple.png...
```

![purple twitch](examples/twitch.purple.png)

**Generate two styles of `circle-play` icons**
```sh
$ node generate-icons.js -n circle-play -s solid
Generating circle-play.solid.png...
$ node generate-icons.js -n circle-play -s regular
Generating circle-play.regular.png...
```

![solid circle-play](examples/circle-play.solid.png) ![regular circle-play](examples/circle-play.regular.png)