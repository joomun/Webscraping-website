const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 3000;
const path = require('path');
const mysql = require('mysql2'); 
const { spawn } = require('child_process');

// Set up your SQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '70Leo@3878',
    database: 'Game_comparison'
  });


app.use(express.json());
app.use(express.static('gamepricescraper/src/main/resources/static')); // Serve your static HTML
app.use('/image', express.static(path.join(__dirname, '../../static/image')));
app.use('/js', express.static(path.join(__dirname, '../../static/js')));

// Endpoint to compile and run the Java program
app.get('/compile-and-run', (req, res) => {

    // Run Maven to compile the project
    exec('mvn clean compile', { cwd: '../../../../../../gamepricescraper' }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Compilation error: ${error}`);
            return res.status(500).send('Failed to compile Java files.');
        }
        console.log(`Compilation stdout: ${stdout}`);
        console.error(`Compilation stderr: ${stderr}`);
        
        // Assuming you have a Maven exec plugin setup to run your main class
        exec('mvn exec:java', { cwd: '../../../../../../gamepricescraper' }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Execution error: ${error}`);
                return res.status(500).send('Failed to run Java program.');
            }
            console.log(`Execution stdout: ${stdout}`);
            console.error(`Execution stderr: ${stderr}`);
            
            // Send the output of your Java program as the response
            res.send(stdout);
        });
    });
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});