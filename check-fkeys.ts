import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  // Find foreign keys for events table
  const fkeys = await pool.query(`
    SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'events';
  `);
  console.log("Events Foreign keys:", fkeys.rows);

  // Find foreign keys for event_members table
  const memberFkeys = await pool.query(`
    SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'event_members';
  `);
  console.log("Event Members Foreign keys:", memberFkeys.rows);

  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
