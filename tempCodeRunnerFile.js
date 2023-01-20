const puppeteer = require("puppeteer");
const axios = require("axios").default;

const link = "https://kwork.ru/projects?c=24";

const token = "5827985997:AAGDh-1l6jrAQ1Wc3WVOaPnxf-TEIeBpgso";
const chatId = "2015142633";
let postLink = `https://api.telegram.org/bot${token}/sendMessage`;

let currentCards = []

async function start() {
	try {
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		await page.goto(link, { waitUntil: "networkidle0" });
		let html = await page.evaluate(async () => {
			let res = [];
			let container = document.querySelectorAll(
				".card.want-card.js-want-container"
			);
			container.forEach((item) => {
				const title = item.querySelector(
					".wants-card__left .wants-card__header-title a"
				).innerText;
				const description = item.querySelector(
					".wants-card__left .wants-card__description-text .breakwords .d-inline"
				).innerText;
				const price = item.querySelector(
					".wants-card__header-price.wants-card__price span[lang]"
				).innerText;
				res.push({
					title,
					description,
					price
				});
			});
			return res;
		});
		let newArray = html.filter(card => currentCards.every(item => item.title !== card.title));
		console.log(newArray);
		newArray.forEach(item => {
			const text = `
${item.title}

${item.description}

${item.price}
			`
			axios.post(postLink, {
				chat_id: chatId,
				text: text,
			});
		})
		currentCards = [...html];
		// console.log(page.$(".wants-content").innerHTML);
	} catch (e) {
		console.log(e);
	}
}

// setInterval(() => {
	start();
// }, 60000);