const { NeoSekaiScraper } = require('../neosekai');
const { sleep } = require('../util');

const fs = require('fs');
const fsPromises = require('fs/promises');
const { join } = require('path');

const DEFAULT_OUT_DIR = join(process.cwd(), 'public', 'novels');

class NovelWriter {
    /**
     * @type {string}
     */
    outDir;

    constructor(outDir = DEFAULT_OUT_DIR) {
        this.outDir = outDir;

        fs.mkdirSync(this.outDir, {
            recursive: true,
        });
    }

    /**
     * Writes all the contents of the specified novel.
     * @param {NeoSekaiScraper} scraper
     * @param {string} novelPath
     * @param {object} options
     * @prop {boolean} options.writeAll
     * @prop {string[]} options.includeChapters If set, only write chapters included in this list.
     */
    async writeAll(scraper, novelPath, options) {
        const novelDir = join(this.outDir, novelPath);
        const chapterDir = join(novelDir, 'chapters');

        await fsPromises.mkdir(novelDir, { recursive: true });
        await fsPromises.mkdir(chapterDir, { recursive: true });

        /**
         * @type {Set<{id: string, path: string, title: string, url: string}>}
         */
        const writeChapters = new Set();
        const listedChapters = await scraper.getChapterList(novelPath).then((chapters) => {
            if (options.includeChapters && options.includeChapters.length > 0) {
                const includeChapters = new Set(options.includeChapters);

                return chapters.filter(
                    (chapter) => includeChapters.has(chapter.id) || includeChapters.has(chapter.path),
                );
            } else {
                return chapters;
            }
        });

        if (!options?.writeAll) {
            const existingChapters = await fsPromises
                .readdir(chapterDir)
                .then((files) => files.map((file) => file.split('.')[0]))
                .then((chapters) => new Set(chapters));

            const newChapters = listedChapters.filter(({ id }) => !existingChapters.has(id));

            for (const chapter of newChapters) writeChapters.add(chapter);
        } else {
            for (const chapter of listedChapters) writeChapters.add(chapter);
        }

        const writePromises = [];

        for (const { id, path, title } of writeChapters.values()) {
            const filePath = join(chapterDir, `${id}.json`);

            const content = await scraper.getChapterContent(novelPath, path).catch((err) => {
                console.error(`Error fetching chapter contents for ${novelPath}/${path}`, err);
            });

            if (!content) continue;

            writePromises.push(
                fsPromises.writeFile(
                    filePath,
                    JSON.stringify(
                        {
                            id,
                            title,
                            content,
                        },
                        null,
                        4,
                    ),
                ),
            );

            await sleep(750);
        }

        const writeResult = await Promise.allSettled(writePromises);

        for (const { reason } of writeResult.filter((settled) => settled.status == 'rejected')) {
            console.error(reason);
        }
    }
}

module.exports = { NovelWriter };
