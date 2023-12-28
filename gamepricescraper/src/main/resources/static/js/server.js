const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 3000;
const path = require('path');

app.use(express.static('static')); // Serve your static HTML

app.get('/', (req, res) => {
    // Run your Java program here
    exec('java -jar ../gamepricescraper/src/main/java/com/example/GamePriceScraper.jar', (err, stdout, stderr) => {
        if (err) {
            // handle error
            console.error(`exec error: ${err}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });

    res.sendFile(path.join(__dirname, '../../templates/index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
