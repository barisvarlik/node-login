const mysql = require('mysql')
const util = require('util')

function makedb( config ) { //wrapper function for creating and connecting database
  const connection = mysql.createconnection( config );
  return {
    query( sql, args ) {
      return util.promisify( connection.query ).call( connection, sql, args );
    },
    close() {
      return util.promisify( connection.end ).call( connection );
    }
  };
}

const db = makedb( config );

async function withTransaction( db, callback ) { //wrapper function for transactions
  try {
    await db.beginTransaction();
    await callback();
    await db.commit();
  } catch ( err ) {
    await db.rollback();
    throw err;
  } finally {
    await db.close();
  }
}

//block for actual query operation 
try { 
  await withtransaction( db, async () => {
    const somerows = await db.query( 'select * from some_table' );
    const otherrows = await db.query( 'select * from other_table' );
    // do something with somerows and otherrows
  } );
} catch ( err ) {
  // handle error
}
