const query = require("./executeQuery");

module.exports = async ({ data } = {}) => {
    const db = await require("./createConnection").open();

    const { error: errorCreate } = await query(db, "CREATE TABLE IF NOT EXISTS logs (" +
        "id INT AUTO_INCREMENT PRIMARY KEY," +
        "ip VARCHAR(15) NOT NULL," +
        "host VARCHAR(255) NOT NULL," +
        "request VARCHAR(255) NOT NULL," +
        "uri VARCHAR(255) NOT NULL," +
        "date DATETIME NOT NULL," +
        "city VARCHAR(255)," +
        "region_name VARCHAR(255)," +
        "region_code VARCHAR(10)," +
        "country VARCHAR(255)," +
        "continent_code VARCHAR(2)," +
        "continent_inEu BOOLEAN," +
        "http_user_agent VARCHAR(255)," +
        "status INT(3) NOT NULL" +
      ");"
      );
    if(errorCreate) throw errorCreate;

    for (const line of data) {
        const { error: errorInsert } = await query(db, "INSERT INTO logs (ip, host, request, uri, date, city, region_name, region_code, country, continent_code, continent_inEu, http_user_agent, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
        [
            line.ip,
            line.host,
            line.request,
            line.uri,
            line.date,
            line.city ? line.city : null,
            line.region && line.region.name ? line.region.name : null,
            line.region && line.region.code ? line.region.code : null,
            line.country ? line.country : null,
            line.continent && line.continent.code ? line.continent.code : null,
            line.continent && line.continent.inEu === true ? true : false,
            line.http_user_agent ? line.http_user_agent : null,
            line.status,
        ]
        );
        if(errorInsert) {
            console.log(line);
            throw errorInsert;
        }
    }

    
    await require("./createConnection").close(db);
}