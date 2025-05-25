import 'dotenv/config'

import express, { RequestHandler, Router } from 'express'
import bodyParser from 'body-parser'
import { NetGSMSender } from './netgsmSms'
import { NetGSMXMLClient } from './netgsmOtp'

const app = express()
app.use(bodyParser.json())

const router = Router()

// Initialize both SMS senders
const smsSender = new NetGSMSender({
  username: process.env.NETGSM_USERNAME || '',
  password: process.env.NETGSM_PASSWORD || '',
})

const otpClient = new NetGSMXMLClient({
  username: process.env.NETGSM_USERNAME || '',
  password: process.env.NETGSM_PASSWORD || '',
  msgheader: process.env.NETGSM_SMSHEADER || 'Baslik',
  appkey: process.env.NETGSM_APPKEY || 'xxx',
})

const SECRET_TOKEN = process.env.SECRET_TOKEN
if (!SECRET_TOKEN) {
  throw new Error('SECRET_TOKEN environment variable is required')
}

interface SMSRequestBody {
  phone: string // full phone number like 905xxxxxxxxx
  message: string
}

// Middleware to check authentication
const authMiddleware: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (authHeader !== `Bearer ${SECRET_TOKEN}`) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  next()
}

// Middleware to validate request body
const validateSMSRequest: RequestHandler = (req, res, next) => {
  const { phone, message } = req.body as SMSRequestBody

  if (!phone || !message) {
    res.status(400).json({ error: 'Missing phone or message' })
    return
  }
  next()
}

// Regular SMS endpoint
const sendSMSHandler: RequestHandler = async (req, res) => {
  const { phone, message } = req.body as SMSRequestBody

  try {
    const smsMessage = NetGSMSender.createMessage(message, phone)
    const request = NetGSMSender.createRequest(
      process.env.NETGSM_SMSHEADER || 'Baslik',
      [smsMessage],
    )

    const response = await smsSender.sendSMS(request)

    if (response.code !== '00') {
      console.error('SMS Error:', response)
      res.status(500).json({
        error: response.description || 'SMS failed',
        code: response.code,
      })
      return
    }

    res.status(200).json({
      success: true,
      jobID: response.jobid,
      description: response.description,
    })
  } catch (err) {
    console.error('SMS Error:', err)
    res.status(500).json({ error: (err as Error).message })
  }
}

// OTP SMS endpoint
const sendOTPHandler: RequestHandler = async (req, res) => {
  const { phone, message } = req.body as SMSRequestBody

  try {
    const response = await otpClient.sendOtpSMS(phone, message)

    if (response.code !== 0) {
      console.error('OTP SMS Error:', response)
      res.status(500).json({
        error: response.error || 'OTP SMS failed',
        code: response.code,
      })
      return
    }

    res.status(200).json({
      success: true,
      jobID: response.jobID,
      type: 'otp',
    })
  } catch (err) {
    console.error('OTP SMS Error:', err)
    res.status(500).json({ error: (err as Error).message })
  }
}

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

// Apply middleware to both endpoints
router.post('/sms/send', authMiddleware, validateSMSRequest, sendSMSHandler)
router.post('/sms/otp', authMiddleware, validateSMSRequest, sendOTPHandler)

app.use('/', router)

const PORT = process.env.PORT || 4400
app.listen(PORT, () => {
  console.log(`Custom SMS Gateway listening on port ${PORT}`)
})
