const axios = require('axios');
const { createObjectCsvWriter } = require('csv-writer');

// Configure CSV writer
const csvWriter = createObjectCsvWriter({
    path: 'water_gas_consumption.csv',
    header: [
        {id: 'datetime', title: 'DATETIME'},
        {id: 'total_eau', title: 'TOTAL_EAU'},
        {id: 'delta_eau', title: 'DELTA_EAU'},
        {id: 'total_gas', title: 'TOTAL_GAS'},
        {id: 'delta_gas', title: 'DELTA_GAS'}
    ]
});

const fetchData = async (startdate, stopdate) => {
    try {
        const response = await axios.post('https://ecobulles.agom.net/cmd/getConsoBoiteItemAppFilter.php', `eco_ref=44B7D095E9C6&eau=1&startdate=${encodeURIComponent(startdate)}&stopdate=${encodeURIComponent(stopdate)}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
};

const processData = async (startdate, enddate) => {
    let currentDate = new Date(startdate);
    const stopDate = new Date(enddate);

    let previousEau = 0;
    let previousGas = 0;
    const records = [];

    while (currentDate <= stopDate) {
        const nextHour = new Date(currentDate.getTime() + 60 * 60 * 1000); // Next hour
        const response = await fetchData(currentDate.toISOString(), nextHour.toISOString());

        if (response && response.status === 1) {
            if (response.data && response.data.infoconso && response.data.infoconso.graph && response.data.infoconso.graph.length > 0) {
                const totalEau = parseFloat(response.data.infoconso.total_eau);
                const totalGas = parseFloat(response.data.infoconso.total_gas);
                const deltaEau = Math.max(totalEau - previousEau, 0); // Ensure delta is not negative
                const deltaGas = Math.max(totalGas - previousGas, 0); // Ensure delta is not negative

                // Update previous values for next calculation
                previousEau = totalEau;
                previousGas = totalGas;

                // Assuming the graph might have multiple entries, but we only need the first for timestamp
                const firstGraphEntry = response.data.infoconso.graph[0];
                records.push({
                    datetime: firstGraphEntry.date.replace(/\//g, "-"), // Correcting date format
                    total_eau: totalEau,
                    delta_eau: deltaEau,
                    total_gas: totalGas,
                    delta_gas: deltaGas
                });
            } else {
                // No consumption data for this hour
                // Push record with the previous totals and deltas of 0
                records.push({
                    datetime: currentDate.toISOString().replace(/\.\d{3}Z$/, 'Z').replace('T', ' '), // Adjusting datetime format
                    total_eau: previousEau,
                    delta_eau: 0,
                    total_gas: previousGas,
                    delta_gas: 0
                });
            }
        } else {
            console.log('Invalid response or data structure', response);
        }

        currentDate = nextHour; // Move to the next hour
    }

    if (records.length > 0) {
        await csvWriter.writeRecords(records)
            .then(() => console.log('CSV file was written successfully.'));
    } else {
        console.log('No records to write to CSV.');
    }
};




// Adjust the enddate to your requirement
processData('2024-03-28T15:15:00.000Z', new Date().toISOString());
