const fs = require('fs');
const ipLocation = require("iplocation");
const moment = require('moment');
const formatString = 'DD/MMM/YYYY:HH:mm:ss Z';

// Chemin du fichier
const filePath = './data/logs/access.log';
if (!fs.existsSync(__dirname + "/data/"))
    fs.mkdirSync(__dirname + "/data/");
if (!fs.existsSync(__dirname + "/data/logs/"))
    fs.mkdirSync(__dirname + "/data/logs/");

(async () => {
    try {
    // Lecture synchrone du fichier
    const file = fs.readFileSync(filePath, 'utf8');

    // Diviser le contenu du fichier par lignes
    const lines = file.split('\n');
    if(lines.length === 1 && lines[0] === "") {
        console.log("No lines in log file");
        process.exit(0);
    }
    const data = [];

    // Boucle à travers chaque ligne et affiche-la
    for (const line of lines) {
        const log = JSON.parse(line);
        const date = moment(log.time_local, formatString).toDate();
        const ipLocationData = await ipLocation(log.client_ip_addr);
        try {
            data.push({ ip: log.client_ip_addr, host: log.host, request: log.request, uri: log.uri, date , city: ipLocationData.city, region: ipLocationData.region, country: ipLocationData.country.name, continent: ipLocationData.continent, http_user_agent: log.http_user_agent, status: log.status });
        } catch (error) {
            //console.log("Error : " + log.client_ip_addr);
            //console.log(ipLocationData);
        }
    }
    await require("./function/insertData")({ data });
    console.log("Finished");
    fs.writeFileSync(filePath, '');
    } catch (err) {
        console.error(`Erreur de lecture du fichier : ${err.message}`);
    }
})();