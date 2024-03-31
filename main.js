const axios = require('axios');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

function hashPassword(password) {
    return crypto.createHash('sha1').update(password).digest('hex');
}

async function login(email, password) {
    const hashedPassword = hashPassword(password);
    const registrationId = 'cI7TFH55eX4:APA91bE-DyQ1QgCIcO2BBfIL1MiAl_afxm9t4o4jQIyXazceonlcmqkUF7BHwZ4J_r06EpVxOY0n8bOIm-0a7VpjItHLBM61-fdEBj4Yy_gR5dyDbyvGtI7YbFHwqfGTwN-eg_4kyKy4';
    const sand = 'B3A2F41213';
    const language = 'fr';
  
    const url = 'https://ecobulles.agom.net/cmd/loginAppUserCo2.php';
    const data = new URLSearchParams({
        email,
        password: hashedPassword,
        registrationId,
        sand,
        language
    });
  
    return axios.post(url, data, { // Make sure to return this promise
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Ecobulles'
        }
    })
    .then(response => response.data.data) // Return the data from the response here
    .catch(error => {
        console.error(error);
        throw error; // It's a good practice to rethrow the error if you're catching it
    });
}



async function getAppUserCo2(ecoRef) {
    const url = 'https://ecobulles.agom.net/cmd/getAppUserCo2.php';
    const data = new URLSearchParams({
        eco_ref: ecoRef
    });
  
    return axios.post(url, data, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Ecobulles'
        }
    })
    .then(response => response.data.data)
    .catch(error => {
        console.error(error);
        throw error;
    });
}

async function getConsoBoiteItemAppFilter(ecoRef, startdate, stopdate) {
    const url = 'https://ecobulles.agom.net/cmd/getConsoBoiteItemAppFilter.php';
    const data = new URLSearchParams({
      eco_ref: ecoRef,
      temp: 0,
      co2: 0,
      eau: 1,
      startdate: startdate,
      stopdate: stopdate
    });
  
    return axios.post(url, data, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Ecobulles'
        }
    })
    .then(response => response.data.data)
    .catch(error => {
        console.error(error);
        throw error;
    });
}
  
async function sendUserCommandBoiteItem(ecoRef, userId, suptime) {
    const url = 'https://ecobulles.agom.net/cmd/sendUserCommandBoiteItem.php';
    const data = new URLSearchParams({
        eco_ref: ecoRef,
        user_id: userId,
        state: 'suspended',
        suptime: suptime
    });
  
    return axios.post(url, data, {
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Ecobulles'
            }
    })
    .then(response => response.data.data)
    .catch(error => {
        console.error(error);
        throw error;
    });
}

async function main(){
    const login_data = await login(process.env.ECOBULLES_EMAIL, process.env.ECOBULLES_PASSWORD)
    let ecoref = login_data.eco_ref;
    let userId = login_data.user_id;
    // console.log(ecoref)

    // console.log(JSON.stringify(login_data, null, 2))
    // console.log(JSON.stringify(await getAppUserCo2(ecoref), null, 2))
    // console.log(JSON.stringify(await getConsoBoiteItemAppFilter(ecoref, '2024-03-29 15:00:00', '2024-03-29 16:00:00'), null, 2))
    console.log(JSON.stringify(await sendUserCommandBoiteItem(ecoref, userId, '10'), null, 2))
}

main()