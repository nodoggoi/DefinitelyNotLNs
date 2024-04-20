#!/usr/bin/env node
const readline = require("readline");

const yargs = require("yargs/yargs");
const {hideBin} = require("yargs/helpers");

const { NeoSekaiScraper } = require("../neosekai");
const { joinChapterContent } = require("../util");

yargs(hideBin(process.argv))
    .command("list", "List all novels", {}, async (argv) => {
        const novels = await new NeoSekaiScraper().getNovelList();

        printNovelList(novels);
    })
    .command("read [novel] [chapter]", "Read a novel", {
        novel: {
            type: "string",
            demandOption: false,
            describe: "The novel to read. If not specified, you will be prompted to select one. This should be the path of the novel as seen in the adressbar of the website, not the title."
        },
        chapter: {
            type: "number",
            demandOption: false
        },
        listReverse: {
            type: "boolean",
            demandOption: false,
            default: false,
            describe: "Reverse the order of the chapters. Lists the older chapters first."
        }
    }, async (argv) => {
        const scraper = new NeoSekaiScraper();

        let {novel, chapter} = argv;

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        if (!novel) {
            const novels = await scraper.getNovelList();

            printNovelList(novels);

            const novelIndex = parseInt(await question("Which novel do you want to read? ", rl)) - 1;

            if (isNaN(novelIndex) || novelIndex < 0 || novelIndex >= novels.length) {
                console.log("Invalid index");
                return;
            }

            novel = novels[novelIndex].path;
        }

        if (!chapter) {
            const chapters = await scraper.getChapterList(novel);

            if (argv.listReverse) {
                chapters.reverse();
            }

            printChapterList(chapters);

            const chapterNumber = parseInt(await question("Which chapter do you want to read? ", rl));

            const maxChapter = Math.max(chapters[chapters.length - 1].number, chapters[0].number);
            const minChapter = Math.min(chapters[0].number, chapters[chapters.length - 1].number);

            if (isNaN(chapterNumber) || chapterNumber < minChapter || chapterNumber >= maxChapter) {
                console.log("Invalid index");
                return;
            }

            chapter = chapterNumber;
        }

        const content = await scraper.getChapterContent(novel, chapter);

        if (!content) {
            console.log("Chapter not found");
            return;
        }

        const text = joinChapterContent(content);

        console.clear();
        console.log(text);
    })
    .parse();

function question(question, interface) {
    return new Promise((resolve) => {
        interface.question(question, resolve);
    });
}

function printNovelList(novels) {
    let i = 1;
    for (const {title, path, thumb} of novels) {
        console.log(`${i} - ${title} (${path})`);
        i += 1;
    }
}

function printChapterList(chapters) {
    for (const {title, number} of chapters) {
        console.log(`${number} - ${title}`);
    }
}