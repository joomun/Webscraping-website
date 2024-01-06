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

// Set up your SQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '70Leo@3878',
    database: 'Game_comparison',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.use(express.json());
app.use(express.static('gamepricescraper/src/main/resources/static')); // Serve your static HTML
app.use('/image', express.static(path.join(__dirname, '../../static/image')));
app.use('/js', express.static(path.join(__dirname, '../../static/js')));
app.use('/css', express.static(path.join(__dirname, '../../static/css')));

// Endpoint to compile and run the Java program

app.get('/compile-and-run', (req, res) => {
    // Inform the client that the compilation has started
    res.write('Compilation has started.\n');

    // Spawn Maven to compile the project
    const compile = spawn('mvn.cmd', ['clean', 'compile'], { cwd: '../../../../../../gamepricescraper' });

    compile.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    compile.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    compile.on('close', (code) => {
        if (code !== 0) {
            res.write('Failed to compile Java files.\n');
            return res.end();
        }

        res.write('Compilation successful. Execution has started.\n');

        // Spawn Maven to run the exec plugin
        const exec = spawn('mvn.cmd', ['exec:java'], { cwd: '../../../../../../gamepricescraper' });

        exec.stdout.on('data', (data) => {
            res.write(data);
        });

        exec.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        exec.on('close', (execCode) => {
            if (execCode !== 0) {
                res.write('Failed to run Java program.\n');
            } else {
                res.write('Execution successful.\n');
            }
            res.end();
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
        const [deals] = await pool.query(`SELECT * FROM games LIMIT 30;`);
        res.json(deals);
    } catch (error) {
        console.error('Error fetching deals:', error);
        res.status(500).json({ message: 'Error fetching deals', error: error.message });
    }
});




app.get('/search', async (req, res) => {
    let searchTerm = req.query.term;
    searchTerm = typeof searchTerm === 'string' ? searchTerm : '';
    try {
        const [results] = await pool.query(`SELECT * FROM games WHERE title LIKE CONCAT('%', ?, '%')`, [searchTerm]);
        
        // Log the results
        console.log("Search Results:", results);
        
        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).send('No games found with that title');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error executing search query');
    }
});




app.get('/api/products', async (req, res) => {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '70Leo@3878',
            database: 'game_comparison'
        });
        // Get page and limit from query string, with default values
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;

        // Rest of your code to handle pagination and query execution...
        const [results] = await connection.execute('SELECT * FROM games LIMIT ?, ?', [offset, limit]);
        res.json(results);

        await connection.end();
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching products');
    }
});
  

// Serve index.html at the root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../templates/index.html'));
});


// Assuming your product.html is in the 'resources/templates' directory
app.get('/product', (req, res) => {
    res.sendFile(path.join(__dirname, '../../templates/product.html'));
});
// Assuming your product.html is in the 'resources/templates' directory
app.get('/product.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../templates/product.html'));
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