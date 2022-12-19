const fs = require('fs');
const { exec } = require('child_process');

console.log('Executing watcher...');

const directoryToWatch = './src';

const callback = async (eventType, filename) => {
	console.log(`Event ${eventType}...`);
	console.log(`File ${filename} changed, running 'npm build'...`);
	const buildPromise = await new Promise((resolve, reject) => {
		exec(`npm run build`, (error, stdout, stderr) => {
			if (error) {
				console.error(`exec error: ${error}`);
				reject(error);
				return;
			}
			console.log(`${stdout}`);
			resolve(true);
		});
	});
	if (buildPromise) {
		exec(`yalc push`, (error, stdout, stderr) => {
			if (error) {
				console.error(`exec error: ${error}`);
				return;
			}
			console.log(`${stdout}`);
		});
	}
};

fs.watch(directoryToWatch, { recursive: true }, callback);
