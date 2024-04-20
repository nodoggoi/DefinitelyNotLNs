#!/usr/bin/env node
const readline = require('readline');

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const { NeoSekaiScraper } = require('../neosekai');
const { joinChapterContent } = require('../util');

yargs(hideBin(process.argv))
    .command(
        'list <service> [novel]',
        'List things!',
        {
            service: {
                type: 'string',
                describe: 'The service to list.',
                demandOption: true,
            },
            novel: {
                type: 'string',
                describe: 'The novel to list chapters of. If not specified, lists all novels instead.',
            },
        },
        async (argv) => {
            if (argv.service !== 'neosekai') return console.log('Invalid service.');

            const scraper = new NeoSekaiScraper();

            const novelPath = argv.novel;

            if (!novelPath) {
                const novels = await scraper.getNovelList();
                printNovelList(novels);
                return;
            }

            const chapters = await scraper.getChapterList(novelPath);

            if (!chapters) {
                console.log('Novel not found!');
                return;
            }

            printChapterList(chapters);
        },
    )
    .command(
        'read <service> [novel] [chapter]',
        'Read a novel',
        {
            service: {
                type: 'string',
                describe: "The service to read from. Currently only supports 'neosekai'.",
                demandOption: true,
            },
            novel: {
                type: 'string',
                demandOption: false,
                describe:
                    'The novel to read. If not specified, you will be prompted to select one. This should be the path of the novel as seen in the adressbar of the website, not the title.',
            },
            chapter: {
                type: 'string',
                demandOption: false,
            },
            listReverse: {
                type: 'boolean',
                demandOption: false,
                default: false,
                describe: 'Reverse the order of the chapters. Lists the older chapters first.',
            },
        },
        async (argv) => {
            if (argv.service !== 'neosekai') return console.log('Invalid service.');

            const scraper = new NeoSekaiScraper();

            let { novel, chapter } = argv;

            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });

            if (!novel) {
                const novels = await scraper.getNovelList();

                printNovelList(novels);

                const answer = await question('Which novel do you want to read? ', rl);
                let novelIndex = parseInt(answer) - 1;

                if (isNaN(novelIndex)) {
                    if (!answer) return console.log('Invalid input');

                    novelIndex = novels.findIndex((novel) => novel.path === answer);
                }

                if (novelIndex <= 0 || novelIndex >= novels.length) return console.log('Invalid index or path.');

                novel = novels[novelIndex].path;
            }

            if (!chapter) {
                const chapters = await scraper.getChapterList(novel);

                if (argv.listReverse) {
                    chapters.reverse();
                }

                printChapterList(chapters);

                const index = parseInt(await question('Which chapter do you want to read? ', rl));

                const id = chapters[index - 1]?.id;

                if (!id) {
                    console.log('Invalid index');
                    return;
                }

                chapter = id;
            }

            const content = await scraper.getChapterContent(novel, chapter);

            if (!content) {
                console.log('Chapter not found');
                return;
            }

            const text = joinChapterContent(content);
            console.log(text);
        },
    )
    .parse();

function question(question, interface) {
    return new Promise((resolve) => {
        interface.question(question, resolve);
    });
}

function printNovelList(novels) {
    let i = 1;
    for (const { title, path, thumb } of novels) {
        console.log(`${i} - ${title} (${path})`);
        i += 1;
    }
}

function printChapterList(chapters) {
    let i = 1;
    for (const { title, id } of chapters) {
        console.log(`${i} - ${title} (${id})`);
        i += 1;
    }
}
