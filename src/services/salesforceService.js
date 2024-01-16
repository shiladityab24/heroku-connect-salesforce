const jsforce = require('jsforce')
const LocalStorage = require('node-localstorage').LocalStorage
const lcStorage = new LocalStorage('./info')
const { SF_LOGIN_URL, SF_CLIENT_ID, SF_CLIENT_SECRET, SF_CALLBACK_URL } = require('../config')
//Initialize OAuth2 Config
const oauth2 = new jsforce.OAuth2({
    loginUrl: SF_LOGIN_URL,
    clientId: SF_CLIENT_ID,
    clientSecret: SF_CLIENT_SECRET,
    redirectUri: SF_CALLBACK_URL
})

//Function to perform Salesforce login
const login = (req, res) => {
    res.redirect(oauth2.getAuthorizationUrl({ scope: 'full refresh_token offline_access' }));
}

//Callback function to get Salesforce Auth token
const callback = (req, res) => {
    console.log(req.query)
    const { code } = req.query
    if (!code) {
        console.log("Failed to get authorization code from server callback")
        return res.status(500).send("Failed to get authorization code from server callback")
    }
    console.log("code", code)
    // res.status(200).send({"success": true,"code":code})
    const conn = new jsforce.Connection({ oauth2: oauth2 })
    conn.authorize(code, function (err) {
        if (err) {
            console.error(err);
            return res.status(500).send(err)
        }
        console.log("Access token", conn.accessToken)
        console.log("refresh token", conn.refreshToken)
        console.log("Instance url", conn.instanceUrl)
        console.log("Connection information", conn)
        
        lcStorage.setItem('accessToken', conn.accessToken || '')
        lcStorage.setItem('instanceUrl', conn.instanceUrl || '')
        lcStorage.setItem('refreshToken', conn.refreshToken || '')
        res.status(200).send({
            "success": true,
            "message": "Authorization code fetched successfully",
            "code": code,
            "Access token": conn.accessToken,
            "refresh token": conn.refreshToken,
            "Instance url": conn.instanceUrl,
            "userInfo": conn.userInfo,
        })
    })
}


const callbackRefreshToken = () => {
    const conn = new jsforce.Connection({
        oauth2 : oauth2,
        instanceUrl : lcStorage.getItem('instanceUrl'),
        accessToken : lcStorage.getItem('accessToken'),
        refreshToken : lcStorage.getItem('refreshToken')
      });
      conn.on("refresh", function(accessToken, res) {
        // Refresh event will be fired when renewed access token
        // to store it in your storage for next request
      });
      // Alternatively, you can use the callback style request to fetch the refresh token
      conn.oauth2.refreshToken(conn.refreshToken, (err, results) => {
        if (err){
            console.error(err);
        }
        lcStorage.setItem('accessToken', results.access_token || '');
        lcStorage.setItem('instanceUrl', results.instance_url || '');
        console.log("Access token", results.access_token)
        console.log("Instance url", results.instance_url)
        console.log("Result", results)
      });
}


// setInterval(login,24 * 60 * 60 * 1000)
setInterval(callbackRefreshToken,6*60*60*1000)  // Access Token will refresh 4-times a day

// conn.on("refresh", function (accessToken, res) {
//     // Refresh event will be fired when the access token is renewed
//     console.log('Access Token has been refreshed: ' + accessToken);
//     conn.accessToken = accessToken
//     lcStorage.setItem('accessToken', conn.accessToken || '')
// });

// Function to Create Connection
const createConnection = () => {
    let instanceUrl = lcStorage.getItem('instanceUrl')
    let accessToken = lcStorage.getItem('accessToken')
    if (!accessToken) {
        return res.status(200).send({})
    }
    return new jsforce.Connection({
        accessToken,
        instanceUrl
    })
}

const leadCreation = (req, res) => {
    const conn = createConnection(res)
    const { leadData } = req.body
    conn.apex.post("/leadApi/", { leadData }, function (err, result) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true, message: 'Record Created Successfully', result });
        }
    })
}

// const loginUser = (req, res) => {
//     const conn = createConnection(res)
//     const { userData } = req.body
//     conn.apex.post("/loginuserApi/", {userData}, function (err, result) {
//         if (err) {
//             res.status(500).json({ error: err.message });
//         } else {
//             res.json(result);
//         }
//     })
// }

const dashboardDetails = (req, res) => {
    const conn = createConnection(res)
    const username = req.params.username;
    // const username = 'shiladitya_bose@persistent.com';
    conn.apex.get(`/checkUserDashboard/checkGetCustomersByDealerUserName?username=${username}`, function (err, result) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    })
}

const checkETB = async (req, res) => {
    const conn = createConnection(res)
    const paylaod = req.body;
    var status;
    await conn.apex.get(`/checkETBApi/checkETBByPan?Pan=${paylaod.panNo}`, function (err, result) {
        if (err) {
            // res.status(500).json({ error: err.message });
            status = {
                statusCode: 404,
                message: err.message,
                data: null,
                isError: true
            }
        } else {
            // res.json(result);
            status = {
                statusCode: 200,
                message: "",
                ...result,
                isError: false
            }
        }
    })
    console.log(status)
    if (!status.ETB) {
        const leadPayload = {
            leadData: {
                firstName: paylaod.firstName,
                lastName: paylaod.lastName,
                mobile: paylaod.mobileNumber,
                panNumber: paylaod.panNo,
                addhaarNumber: "",
                emailId: "",
                loanType: ""
            }
        }
        await conn.apex.post("/leadApi/", leadPayload, function (err, result) {
            if (err) {
                // res.status(500).json({ error: err.message });
                status = {
                    statusCode: 404,
                    message: err.message,
                    data: null,
                    isError: true
                }
            } else {
                // res.json({ success: true, message: 'Record Created Successfully', result });
                status = {
                    statusCode: 200,
                    ...result,
                    isError: false
                }
            }
        })
    }
    res.status(status.statusCode).json(status)
}

const loanApplication = (req, res) => {
    const conn = createConnection(res)
    const { requestWrapper } = req.body
    conn.apex.post("/checkLoanApplicationApi/", { requestWrapper }, function (err, result) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    })
}


module.exports = {
    login,
    callback,
    leadCreation,
    dashboardDetails,
    checkETB,
    loanApplication
}