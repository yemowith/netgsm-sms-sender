import 'dotenv/config'
import express, { Request, Response, Router } from 'express'
import bodyParser from 'body-parser'
import { NetGSMSender } from './netgsmSms' // kendi NetGSM sınıfın

const app = express()
app.use(bodyParser.json())

const router = Router()

// SMS Gönderici sınıfını başlat
const smsSender = new NetGSMSender({
  username: process.env.NETGSM_USERNAME || '',
  password: process.env.NETGSM_PASSWORD || '',
})

// Supabase'den gelen payload için type tanımı
interface SupabaseSMSPayload {
  user: {
    id: string
    phone: string
    [key: string]: any
  }
  sms: {
    otp: string
  }
}

// Middleware: geçerli payload kontrolü
const validateSMSRequest = (req: Request, res: Response, next: () => void) => {
  const body = req.body as SupabaseSMSPayload
  if (!body?.user?.phone || !body?.sms?.otp) {
    res.status(400).json({ error: 'Missing phone or OTP' })
    return
  }
  next()
}

// SMS gönderme handler'ı
const sendSMSHandler = async (req: Request, res: Response) => {
  const { user, sms } = req.body as SupabaseSMSPayload
  const phone = user.phone.replace('+', '') // + işaretini kaldır
  const otp = sms.otp

  try {
    const smsMessage = NetGSMSender.createMessage(`Kodunuz: ${otp}`, phone)
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

// Sağlık kontrol endpoint'i
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

// Supabase SMS Hook endpoint'i
router.post('/sms/send', validateSMSRequest, sendSMSHandler)

// Router'ı uygula
app.use('/', router)

// Sunucu başlat
const PORT = process.env.PORT || 4400
app.listen(PORT, () => {
  console.log(`Custom SMS Gateway listening on port ${PORT}`)
})
