const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

async function getChapterContent(url) {
    const $ = await axios.get(url).then(res => cheerio.load(res.data));

    let content = ""

    $(".entry-content p").each((i, el) => {
        const paragraph = $(el).text().trim();

        if (paragraph.length > 0) {
            content += paragraph + "\n\n";
        }
    });

    return content;
}

async function main() {
    const text = await getChapterContent("https://www.neosekaitranslations.com/novel/transfer-student/");
    fs.writeFileSync("chapter.txt", text);
}

main();