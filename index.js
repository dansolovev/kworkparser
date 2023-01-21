const puppeteer = require("puppeteer");
const axios = require("axios").default;
const cron = require("node-cron");
const fs = require("fs");

const link = "https://kwork.ru/projects?c=24";

const token = "5827985997:AAGDh-1l6jrAQ1Wc3WVOaPnxf-TEIeBpgso";
const chatId = "2015142633";
let postLink = `https://api.telegram.org/bot${token}/sendMessage`;

async function start() {
	try {
		const browser = await puppeteer.launch({
			headless: true,
			args: ["--no-sandbox"],
		});
		const page = await browser.newPage();
		await page.goto(link, { waitUntil: "networkidle0" });
		await page.waitForSelector(
			".wants-card__header-price.wants-card__price span[lang]"
		);
		let html = await page.evaluate(async () => {
			let res = [];
			let container = document.querySelectorAll(
				".card.want-card.js-want-container"
			);
			container.forEach((item) => {
				const titleBlock = item.querySelector(
					".wants-card__left .wants-card__header-title a"
				);
				const title = titleBlock ? titleBlock.innerText : ""
				const descBlock = item.querySelector(
					".wants-card__left .wants-card__description-text .breakwords .d-inline"
				);
				const description = descBlock ? descBlock.innerText : ""
				const priceBlock = item.querySelector(
					".wants-card__header-price.wants-card__price span[lang]"
				);
				const price = priceBlock ? priceBlock.innerText : "";
				res.push({
					title,
					description,
					price
				});
			});
			return res;
		});
		writeJson(html)
		await page.close();
		await browser.close();
		// let newArray = html.filter(card => currentCards.every(item => item.title !== card.title));
	} catch (e) {
		console.log(e);
	}
}

function writeJson(parsedInfo) {
	let rawdata = fs.readFileSync("results.json");
	let results = [];
	try {
		results = JSON.parse(rawdata);
	} catch (error) {
		console.log(error);
	}

	let arrayToSend = parsedInfo.filter((card) =>
		results.every((item) => item.title !== card.title)
	);

	let data = JSON.stringify(parsedInfo);
	fs.writeFileSync("results.json", data);

	sendData(arrayToSend);
}

function sendData(array) {
			array.forEach((item) => {
				const text = `
${item.title}

${item.description}

${item.price}
			`;
				axios.post(postLink, {
					chat_id: chatId,
					text: text,
				});
			});
}

// setInterval(() => {
	// start();
// }, 600000);
cron.schedule("*/5 * * * *", function () {
	start();
});