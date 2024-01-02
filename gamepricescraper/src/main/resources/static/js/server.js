const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 3000;
const path = require('path');
const mysql = require('mysql2/promise'); // Using mysql2 with async/await support

const { spawn } = require('child_process');

// Set up your SQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '70Leo@3878',
    database: 'Game_comparison'
  });

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '70Leo@3878',
    database: 'Game_comparison'
};

app.use(express.json());
app.use(express.static('gamepricescraper/src/main/resources/static')); // Serve your static HTML
app.use('/image', express.static(path.join(__dirname, '../../static/image')));
app.use('/js', express.static(path.join(__dirname, '../../static/js')));
app.use('/css', express.static(path.join(__dirname, '../../static/css')));

// Endpoint to compile and run the Java program
app.get('/compile-and-run', (req, res) => {
    // Inform the client that the compilation has started
    res.write('Compilation has started.\n');

    // Run Maven to compile the project with increased maxBuffer
    exec('mvn clean compile', { cwd: '../../../../../../gamepricescraper', maxBuffer: 1024 * 1024 * 5 }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Compilation error: ${error}`);
            res.write('Failed to compile Java files.\n');
            return res.end(); // Make sure to end the response here
        }

        res.write('Compilation successful. Execution has started.\n');

        // Assuming you have a Maven exec plugin setup to run your main class with increased maxBuffer
        exec('mvn exec:java', { cwd: '../../../../../../gamepricescraper', maxBuffer: 1024 * 1024 * 5 }, (error, execStdout, execStderr) => {
            if (error) {
                console.error(`Execution error: ${error}`);
                res.write(`Failed to run Java program. Details: ${execStderr}`);
                return res.end(); // Make sure to end the response here
            }

            // Send the output of your Java program as part of the response
            res.write('Execution successful.\n');
            res.write(execStdout);
            res.end(); // End the response after sending the output
        });
    });
});

// Function to get deals from the database
const getDealsFromDatabase = async () => {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [results, fields] = await connection.execute(`
            SELECT * 
            FROM games 
            LIMIT 30;
        `);
        return results;
    } finally {
        await connection.end();
    }
};

// Example Node.js route to get deals from the database
app.get('/api/deals', async (req, res) => {
    try {
        const deals = await getDealsFromDatabase();
        res.json(deals);
    } catch (error) {
        console.error('Error fetching deals:', error);
        res.status(500).json({ message: 'Error fetching deals', error: error.message });
    }
});



// API endpoint for searching the database
app.get('/search', (req, res) => {
    const searchTerm = req.query.term;
    connection.query('SELECT * FROM yourTable WHERE yourSearchColumn LIKE ?', [`%${searchTerm}%`], (error, results, fields) => {
      if (error) {
        res.status(500).send('Database query failed');
        throw error;
      }
      res.json(results);
    });
  });

// Serve index.html at the root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../templates/index.html'));
});

app.use((err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).send('An error occurred');
  });
  

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});