import { Client } from 'cassandra-driver';
const client = new Client({
    cloud: { secureConnectBundle: './secure-connect-test.zip' },
    credentials: {
      username: 'DndjqgLtqmAoPyHgiJwMehDN',
      password: 'UHYXfT.9EO5+a11HMQttn1z7_5SRQ6lRR4gYQjYPH2.E5Y6HCtUAM3WlBPOL6ZqwOMfAbiw05v13opTjYmlNjxGxjGo6Beba1QuQIY.DohdnfOujZPk,FAu5TIXrz6SI'
    }
  });

  await client.connect();

  // Execute a query
  const rs = await client.execute("SELECT * FROM account.login_email");
  console.log(`Your cluster returned ${rs.rowLength} row(s)`);

  await client.shutdown();