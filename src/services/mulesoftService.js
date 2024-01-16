// -------------------------------------------------------------------------------------------
//          PAN-PROFILE
//--------------------------------------------------------------------------------------------


const { Pool } = require("pg")
require("dotenv").config()
// console.log(process.env.PG_HOST)

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
})

pool.on("connect", () => {
    console.log("Connected to DB successfully!")
})

pool.on("end", () => {
    console.log("Connection Ended")
})


const axios = require("axios")
const https = require('https')
var path = require('path');
const fs = require('fs')

// const connection = async () => {
//     var count = await pool.query(`select * from public.panProfile`)
//     console.log(count);
// }
// connection()

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
    cert: fs.readFileSync(__dirname + '/ca.crt'),
    key: fs.readFileSync(__dirname + '/ca.key')
});

const panProfile = async (req, res) => {
    const obj = req.body;

    console.log(obj)
    try {
        const resp = await axios.post("https://pan-profile-eapi-dev-jyo9jx.5sc6y6-4.usa-e2.cloudhub.io/api/pan-profile", obj, { httpsAgent })
        console.log("Response", resp)
        const createprofile = await pool.query(`INSERT INTO panProfile(id,request,response,pan_number)
        VALUES(extract(epoch from current_timestamp),'${JSON.stringify(obj)}','${JSON.stringify(resp.data)}','${obj.pan}');`);
        res.status(200).send({success:true,response:resp.data});

    } catch (error) {
        console.log(error)
        res.status(404).send(error)
    }

}

module.exports = {
    panProfile
}