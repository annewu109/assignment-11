const fs = require('fs');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://annewu:Welcome1234@assignment10.ic7wyna.mongodb.net/?retryWrites=true&w=majority&appName=assignment10";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        await client.connect();
        const database = client.db('Stock');
        const companies = database.collection('PublicCompanies');

        var rows;
        const data = await fs.promises.readFile("companies-1.csv", 'utf8');
        const lines = data.trim().split('\n');
        const headers = lines[0].split(',');
        rows = lines.slice(1).map(line => {
            const values = line.split(',');
            return headers.reduce((obj, header, i) => {
                
                //checks to see if inserting rpice to object
                if (i == 2) {
                    obj[header.trim()] = parseFloat(values[i].trim());
                }
                else {
                    obj[header.trim()] = values[i].trim();
                }
                
                return obj;
            }, {});
        });

        // Prevent additional documents from being inserted if one fails
        const options = { ordered: true };

        const result = await companies.insertMany(rows, options);

        // Print result
        console.log(`${result.insertedCount} documents were inserted`);
    }

    finally {
    // Ensures that the client will close when you finish/error
    await client.close();
}
}
run().catch(console.dir);