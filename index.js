const express = require("express");
const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "SQLWorkbench2.0",
  database: "havahavaidb",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");
});

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

app.get("/airport/:iata_code", (req, res) => {
  const iataCode = req.params.iata_code;
  console.log(req.params);
  console.log(iataCode);

  let sqlQuery = `SELECT airport.id as airport_id, airport.icao_code, airport.iata_code, airport.name, airport.type, airport.latitude_deg, airport.longitude_deg, airport.elevation_ft,
           city.id as city_id, city.name as city_name, city.country_id as city_country_id, city.is_active as city_is_active, city.lat as city_lat, city.long as city_long,
           country.id as country_id, country.name as country_name, country.country_code_two, country.country_code_three, country.mobile_code, country.continent_id
    FROM airport
    LEFT JOIN city  ON airport.city_id = city.id
    LEFT JOIN country  ON city.country_id = country.id
    WHERE airport.iata_code =`
  ;
  sqlQuery=sqlQuery.concat("'",iataCode,"'");
  console.log(sqlQuery);

  connection.query(sqlQuery, [iataCode], (err, results) => {
    if (err) {
      console.error("Error fetching airport data:", err);
      res.status(500).send("Error fetching airport data");
      return;
    }

    if (results.length === 0) {
      res.status(404).send("Airport not found");
      return;
    }

    const row = results[0];
    const response = {
      airport: {
        id: row.airport_id,
        icao_code: row.icao_code,
        iata_code: row.iata_code,
        name: row.name,
        type: row.type,
        latitude_deg: row.latitude_deg,
        longitude_deg: row.longitude_deg,
        elevation_ft: row.elevation_ft,
        address: {
          city: {
            id: row.city_id,
            name: row.city_name,
            country_id: row.city_country_id,
            is_active: row.city_is_active,
            lat: row.city_lat,
            long: row.city_long
          },
          country: row.country_id ? {
            id: row.country_id,
            name: row.country_name,
            country_code_two: row.country_code_two,
            country_code_three: row.country_code_three,
            mobile_code: row.mobile_code,
            continent_id: row.continent_id
          } : null
        }
      }
    };

    res.json(response);
  });
});