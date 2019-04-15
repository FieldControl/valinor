# btob
Binary to binary encoding tool

## Installation
npm install -g btob

## Usage
```
  Usage: btob [options] <action> <inputFile> <outputFile>

  Action: [encode|decode]

  Options:

    -V, --version  output the version number
    -f, --flip     flip each byte
    -r, --reverse  reverse each byte
    -h, --help     output usage information
 ```

Example of execution:
```
> echo "123" > raw.txt

> btob encode raw.txt encoded.txt

> cat encoded.txt
s�3�

> btob decode encoded.txt decoded.txt

> cat decoded.txt
123
```