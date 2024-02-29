const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

/**
 * Helper function to generate SQL syntax for a partial update. 
 * 
 * Given a JavaScript object representing the columns to be updated and a mapping of  
 * JavaScript to SQL column names,
 * this function constructs the SQL SET clause for use in a SQL UPDATE statement.
 * 
 * For example:
 * 
 *  sqlForPartialUpdate({firstName: 'Aliya', age: 32}, {firstName: 'first_name'})
 *  // Returns: 
 *  //  {
 *  //    setCols: '"first_name"=$1, "age"=$2',
 *        values: ['Aliya', 32]
 *  //  }
 * 
 * @param {Object} dataToUpdate - An object containing columns to update.
 * @param {Object} jsToSql - A mapping of JavaScript object keyes to SQL column names.
 * @returns {Object} - An object with 'setCols' and 'values' properties for SQL UPDATE. 
 * @throws {BadRequestError} - If the 'dataToUpdate' object is empty. 
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // Map each key to its corresponding SQL syntax, using provided mapping or default to key
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
