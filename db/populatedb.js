const { Client } = require("pg");

const SQL = `
CREATE TABLE IF NOT EXISTS <tablename> (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  username VARCHAR ( 255 )
);`

async function main() {
  console.log("seeding...");
  const client = new Client({
    connectionString: "postgresql://stefanvitanov:rino@localhost:5432/<db name>",
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("done");
}

main();