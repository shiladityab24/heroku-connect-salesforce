const express = require('express')
const router = express.Router()
const salesforceService = require('../services/salesforceService')
const mulesoftService = require('../services/mulesoftService')
router.get('/login', salesforceService.login)
router.get('/callback', salesforceService.callback)
router.post('/api/lead/create', salesforceService.leadCreation)
router.get('/api/:username', salesforceService.dashboardDetails)
router.post('/api/loanApplication/create', salesforceService.loanApplication)
router.post('/api/ETB/', salesforceService.checkETB)
router.post('/api/pan-profile/', mulesoftService.panProfile)
module.exports = router