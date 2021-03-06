const properties = require('./json/properties.json');
const users = require('./json/users.json');
const {Pool} = require('pg');


const pool = new Pool({
  user: 'heeya',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});
/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
 
const getUserWithEmail = function(email) {
  let user;
  for (const userId in users) {
    user = users[userId];
    if (user.email.toLowerCase() === email.toLowerCase()) {
      break;
    } else {
      user = null;
    }
  }
   pool 
    .query(`SELECT * FROM users WHERE email= $1`, [email])
    .then((result) => {
      // console.log("==============", result.rows.length);
      result.rows
    })
    .catch((err) => {
      console.log(err.message);
    });
  return Promise.resolve(pool);
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {

  pool 
  .query(`SELECT * FROM users WHERE id= $1`, [id])
  .then((result) => {
    // console.log("==============", result.rows.length);
    result.rows
  })
  .catch((err) => {
    console.log(err.message);
  });
  return Promise.resolve(pool);
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  const userId = Object.keys(users).length + 1;
  user.id = userId;
  users[userId] = user;
  pool 
  .query(`INSERT INTO users (name, email, password)
  VALUES($1, $2, $3); `, [user.name, user.email, user.password ])
  .then((result) => {result.rows})
  .catch((err) => {
    console.log(err.message);
  });
  return Promise.resolve(user);
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  pool 
    .query(`SELECT * FROM reservations WHERE guest_id = $1 LIMIT $2`, [guest_id, limit])
    .then((result) => {
      // console.log("==============", result.rows.length);
      result.rows
    })
    .catch((err) => {
      console.log(err.message);
    });
  return getAllProperties(null, 2);
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */

  const getAllProperties = function (options, limit = 10) {
    // 1
    const queryParams = [];
    // 2
    let queryString = `
    SELECT properties.*, avg(property_reviews.rating) as average_rating
    FROM properties
    JOIN property_reviews ON properties.id = property_id
    `;
  
    // 3
    if (options.city) {
      queryParams.push(`%${options.city}%`);
      queryString += `WHERE city LIKE ${queryParams.length} AND`;
    }
    if (options.owner_id) {
      queryParams.push(`${options.owner_id}`);
      queryString += `owner_id = ${queryParams.length} AND`;
    }
    if (options.minimum_price_per_night && options.maximum_price_per_night) {
      queryParams.push(`${options.minimum_price_per_night}`);
      queryParams.push(`${options.maximum_price_per_night}`);
      queryString += `price_per_night (BETWEEN ${queryParams.length} AND ${queryParams.length}) AND`;
    }
    if (options.minimum_rating) {
      queryParams.push(`${options.minimum_rating}`);
      queryString += `rating >= ${queryParams.length}`
    }
  
    // 4
    queryParams.push(limit);
    queryString += `
    GROUP BY properties.id
    ORDER BY cost_per_night
    LIMIT $${queryParams.length};
    `;
  
    // 5
    console.log(queryString, queryParams);
  
    // 6
    return pool.query(queryString, queryParams).then((res) => res.rows);
  };

exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  pool 
  .query(`INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, parking_spaces, number_of_bathrooms, number_of_bedrooms, country, street, city, province, post_code, active)
  VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14); `, 
  [properties.owner_id, properties.title, properties.description,properties.thumbnail_photo_url, properties.cover_photo_url, properties.cost_per_night,properties.parking_spaces, properties.number_of_bathrooms, properties.number_of_bedrooms, properties.country, properties.street, properties.city, properties.province, properties.post_code, properties.active])
  .then((result) => {
    result.rows
  })
  .catch((err) => {
    console.log(err.message);
  });
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
