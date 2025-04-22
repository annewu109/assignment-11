const http = require('http');
const querystring = require('querystring');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://annewu:Welcome1234@assignment10.ic7wyna.mongodb.net/?retryWrites=true&w=majority&tls=true"
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run(search_type, search_query) {
    try {
        await client.connect();
        const database = client.db('Stock');
        const companies = database.collection('PublicCompanies');

        const query = {
            [search_type]: { $regex: search_query, $options: 'i' }
        };

        const cursor = companies.find(query);
        const results = await cursor.toArray(); // await first
        return results; // then return
    }
  catch (err) {
    console.error("MongoDB run() error:", err);
    throw err;
  }
    finally {
        await client.close();
    }
};

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    // Serve the form
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <body>
          <h2>Stock Search</h2>
          <form method="POST" action="/submit">
            <label>Search: <input type="text" name="searchQuery" /></label><br />
            <input type="radio" id="ticker" name="search_for" value="Ticker">
            <label for="html">Ticker Symbol</label><br>
            <input type="radio" id="company" name="search_for" value="Company">
            <label for="css">Company Name</label><br>
            <input type="submit" value="Submit" />
          </form>
        </body>
      </html>
    `);
  } else if (req.method === 'POST' && req.url === '/submit') {
    // Handle form submission
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString(); // convert Buffer to string
    });

    req.on('end', async () => {
      const parsedData = querystring.parse(body); // parses x-www-form-urlencoded
      console.log('Form Data:', parsedData);

      if (!parsedData.search_for || !parsedData.searchQuery) {
        console.error("Missing form data:", parsedData);
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        return res.end("Invalid input.");
      }

      const results = await run(parsedData.search_for, parsedData.searchQuery);

      var searchResults = "";
      results.forEach(function(result) {
        searchResults += 
        `<div class='search-result'>
        <h3>${result['Company']}</h3> 
        <h4>${result['Ticker']}</h4>
        <p>${result['Price']}</p>
        </div>`;
      });
      if (searchResults == "") {
        searchResults = "<p>No results found.</p>"
      }
      console.log(results);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
            <head>
             <style>
             .search-result {
                width: 30%;
                background-color: aquamarine;
                text-align: center;
            }
             </style>
            </head>
          <body>
            <h2>Thank you!</h2>
            <p>your search: ${parsedData.searchQuery}</p>
            <p>your search type: ${parsedData.search_for}</p>
            <h2>Search Results: </h2>`+ searchResults + `
          </body>
        </html>
      `);
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

//const PORT = 8080; //local
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  //console.log(`Server running at http://localhost:${PORT}`);
});