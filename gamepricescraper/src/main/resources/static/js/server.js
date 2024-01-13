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
app.use('/video', express.static(path.join(__dirname, '../../static/video')));
app.use('/js', express.static(path.join(__dirname, '../../static/js')));
app.use('/css', express.static(path.join(__dirname, '../../static/css')));

const fifteenMinutesInMillis = 15 * 60 * 1000; // 15 minutes in milliseconds

// Endpoint to compile and run the Java program
const checkExecutionTime = (req, res, next) => {
    const currentTime = Date.now();

    if (currentTime - lastExecutionTime >= fifteenMinutesInMillis) {
        // Allow the request to proceed
        lastExecutionTime = currentTime;
        next();
    } else {
        // Return an error response indicating the need to wait
        res.status(429).send('Please wait for 15 minutes before running this again.');
    }
};

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
    setTimeout(() => {
        lastExecutionTime = 0;
    }, fifteenMinutesInMillis);
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
            // If no games are found, redirect to the "no search results found" page
            return res.redirect('/no-search-results.html');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error executing search query');
    }
});





app.get('/api/products', async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 12; // Set the limit to 12 items per page
    const offset = (page - 1) * limit;
    try {
        const [products] = await pool.execute('SELECT * FROM games LIMIT ?, ?', [offset, limit]);
        if (products.length === 0) {
            // If no products are found, redirect to the "no product found" page
            return res.redirect('/no-product-found.html');
        }
        const [totalItemsResult] = await pool.execute('SELECT COUNT(*) AS total FROM games');
        const totalItems = totalItemsResult[0].total;
        const totalPages = Math.ceil(totalItems / limit);
        console.log('Total items:', totalItems);
        res.json({
            products: products,
            page: page,
            totalPages: totalPages,
            totalItems: totalItems
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching products');
    }
});



app.get('/api/product/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        let matchedGameName = '';

        // Check if the provided productId matches either matched_game_id or original_game_id in the Comparison table
        const matchingComparison = await pool.query(`
            SELECT 
                original_game_id, 
                matched_game_id
            FROM 
                Comparison
            WHERE 
                original_game_id = ? OR matched_game_id = ?`, [productId, productId]);

        if (matchingComparison.length === 0) {
            // If no matching comparison is found, send a 404 error
            res.status(404).json({ message: 'Comparison not found' });
            return; // Stop the execution here
        }
        console.log('Matching comparison:', matchingComparison);

        // Fetch matched_game_name based on the provided productId
        const [matchedGameNameResult] = await pool.query(`
            SELECT 
                matched_game_name
            FROM 
                Comparison
            WHERE 
                original_game_id = ? OR matched_game_id = ?`, [productId, productId]);

        if (matchedGameNameResult.length > 0) {
            matchedGameName = matchedGameNameResult[0].matched_game_name;
        }

        // Fetch all entries from the Comparison table that have the same matched_game_name
        const [matchingEntries] = await pool.query(`
            SELECT 
                original_game_id, 
                original_game_name, 
                original_platform, 
                original_price, 
                matched_game_id, 
                matched_game_name, 
                matched_platform, 
                matched_price
            FROM 
                Comparison
            WHERE 
                matched_game_name = ?`, [matchedGameName]);

        // Query to get product details from the games table
        const [gamesDetails] = await pool.query('SELECT id, title, price, platform, image_url, url FROM games WHERE id = ?', [productId]);

        // Query to get game requirements from the game_requirements table
        const [requirementsDetails] = await pool.query('SELECT * FROM game_requirements WHERE game_id = ?', [productId]);

        // Query to get original game details based on original_game_id
        const [originalGameDetails] = await pool.query('SELECT id, title, price, platform, image_url, url FROM games WHERE id = ?', [matchingEntries[0].original_game_id]);

        // Combine the initial comparison details and additional entries
        const allComparisonDetails = matchingEntries.concat(matchingEntries);

        // Combine the details into a single object to send as response
        const response = {
            product: gamesDetails[0],
            requirements: requirementsDetails[0] || {},
            comparisons: allComparisonDetails,
            original_game: originalGameDetails[0] || null, // Add original game details
        };

        // Send the response
        res.json(response);
        console.log('Response:', response);
    } catch (error) {
        console.error('Error fetching game details:', error);
        // Only send the error response if no response has been sent yet
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error fetching game details', error: error.message });
        }
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

app.get('/product-detail.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../templates/product-detail.html'));
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