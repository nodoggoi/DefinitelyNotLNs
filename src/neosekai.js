const axios = require("axios");
const cheerio = require("cheerio");

const NEOSEKAI_BASE_URL = "https://www.neosekaitranslations.com";

/**
 * Scraper for [NeoSekai translations](https://www.neosekaitranslations.com/).
 */
class NeoSekaiScraper {
    constructor() {
        this.instance = axios.create({
            baseURL: NEOSEKAI_BASE_URL,
            withCredentials: true
        });
    }

    /**
     * @returns {Promise<{title: string, path: string, thumb: string}[]>}
     */
    async getNovelList() {
        const $ = await this.instance({url: "novel"}).then(res => cheerio.load(res.data));

        const novels = [];

        $(".page-item-detail.text").each((_, el) => {
            const $el = $(el);

            const thumb = $el.find("img").attr("src");
            const title = $el.find("h3.h5").text().replaceAll(/[\n\t]/g, "").trim().replaceAll(/^(HOT|NEW) */g, "");
            const url = $el.find("h3 > a").attr("href");

            const path = url.replace(NEOSEKAI_BASE_URL + "/novel", "").replaceAll("/", "");

            novels.push({
                title,
                path,
                thumb,
            });
        });

        return novels;
    }

    /**
     * Returns the list of chapters for a given novel.
     * @param {string} novelPath 
     * @returns {Promise<{title: string, url: string, id: string}>}
     */
    async getChapterList(novelPath) {
        const $ = await this.instance({url: `novel/${novelPath}`}).then(res => cheerio.load(res.data));

        const $body = $("body");

        const mangaId = $body.attr("class").split(" ").find(c => c.startsWith("postid-")).replace("postid-", "");

        const $chapterList = await this.instance({url: "wp-admin/admin-ajax.php", data: {action: "manga_get_chapters", manga: mangaId}, method: "POST", headers: {
            "Accept": "*/*",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            Cookie: "wpmanga-reading-history=W3siaWQiOjE1NTQsImMiOiIyNjE2IiwicCI6MSwiaSI6IiIsInQiOjE3MTM2MDgxNDd9XQ%3D%3D",
            DNT: 1,
            Origin: NEOSEKAI_BASE_URL,
            Referrer: NEOSEKAI_BASE_URL + `/novel/${novelPath}`,
            "X-Requested-With": "XMLHttpRequest"
        }}).then(res => cheerio.load(res.data));

        const chapters = [];

        $chapterList("li.wp-manga-chapter").each((i, el) => {
            const $el = $(el);
            
            const $a = $el.find("a");
            const fullTitle = $a.text();

            const title = fullTitle.replace(/Chapter [0-9]+ +\- +/, "").trim();

            const url = $a.attr("href");

            const id = url.split("/").filter(c => !!c).pop();
            
            chapters.push({
                title,
                url,
                id,
            });
            
        });

        return chapters;
    }

    /**
     * @param {string} novelPath
     * @param {number} chapter
     * @returns {Promise<string[] | null>} The chapter's paragraphs, or null if the chapter doesn't exist.
     */
    async getChapterContent(novelPath, chapterPath) {
        try {
            const $ = await this.instance({url: `novel/${novelPath}/${chapterPath}`}).then(res => cheerio.load(res.data));
            const content = [];
    
            // p > span because the last paragraph contains a script to add a kofi button to the bottom, and we don't need that.
            $(".entry-content p > span").each((i, el) => {
                const paragraph = $(el).text().trim();
    
                if (paragraph.length > 0) {
                    content.push(paragraph);
                }
            });
    
            if (content.length == 0) {
                return null;
            }

            return content;
        } catch (error) {
            if (error instanceof axios.AxiosError && error.response.status == 404) {
                return null;
            }

            throw error;
        }
    }
}

module.exports = { NeoSekaiScraper };