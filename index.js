#!/usr/bin/env node

const fs = require('fs');
const {twig} = require('twig')
const { program } = require('commander');

program
    .requiredOption('-t <path>', 'path to twig file')
    .requiredOption('-d <path>', 'path to data file (JSON)')
    .option('-o <path>', 'path to output file (JSON)')

program.parse();

const opts = program.opts();

const template = opts['t']
console.log(`template file: ${template}`)

const data = opts['d']
console.log(`data file: ${data}`)

const output = opts['o'] || './output.html'
console.log(`output file: ${output}`)

fs.watchFile(template, (curr, prev) => {
    compile()
});

fs.watchFile(data, (curr, prev) => {
    compile()
});

console.log(`Watching template and data files, make any change`)

const compile = () => {
    console.log(`file Changed`);

    var templateData;
    try{
        templateData =  JSON.parse(fs.readFileSync(data, 'utf8'));
    }catch (e) {
        console.error(`Error reading data file`)
        return;
    }

    var templateBuffer;
    try{
        const twigTemplateAsBase64 = fs.readFileSync(template, {encoding: 'base64'});
        templateBuffer = Buffer.from(twigTemplateAsBase64, 'base64').toString('utf-8')
    }catch (e) {
        console.error(`Error reading template file`)
        return;
    }

    var result;
    try {
        result = twig({
            data: templateBuffer
        }).render(templateData);
    }catch (e) {
        console.error(`Error compiling twig`)
        return;
    }

    console.log(`writing output in ${output}`)
    fs.writeFile(output, result, err => {
        if (err) {
            console.error(err);
        }
    });
}

