const { sqlForPartialUpdate } = require('./sql');
const { BadRequestError } = require('../expressError');

describe('sqlForPartialUpdate', () => {
    // Test case for 1 valid input.
    test('generates correct SQL syntax for partial update of 1 valid input', () => {
        const dataToUpdate = { firstName: 'Aliya'};
        const jsToSql = { firstName: 'first_name' };
        const expectedResult = {
            setCols: '"first_name"=$1',
            values: ['Aliya']
        };
        const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
        expect(result).toEqual(expectedResult);
    })
    // Test case for 2 valid inputs. 
    test('generates correct SQL syntax for partial update of 1 valid input', () => {
        const dataToUpdate = { firstName: 'Alice', age: 32 };
        const jsToSql = { firstName: 'first_name' };
        const expectedResult = {
            setCols: '"first_name"=$1, "age"=$2',
            values: ['Alice', 32]
        };
        const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
        expect(result).toEqual(expectedResult);
    })
    // Test case for empty dataToUpdate object
    test('throws BadRequestError when dataToUpdate is empty', () => {
        const dataToUpdate = {};
        const jsToSql = { firstName: 'first_name' };
        const testFn = () => {
            sqlForPartialUpdate(dataToUpdate, jsToSql);
        }
        expect(testFn).toThrow(BadRequestError);
    })
});