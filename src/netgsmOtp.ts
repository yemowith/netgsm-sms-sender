import fetch from 'node-fetch'

export class NetGSMXMLClient {
  private username: string
  private password: string
  private msgheader: string
  private appkey: string

  constructor(config: {
    username: string
    password: string
    msgheader: string
    appkey: string
  }) {
    this.username = config.username
    this.password = config.password
    this.msgheader = config.msgheader
    this.appkey = config.appkey
  }

  private async xmlPost(url: string, xmlData: string): Promise<string> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
      },
      body: xmlData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.text()
  }

  public async sendOtpSMS(
    phone: string,
    message: string,
  ): Promise<{ code: number; jobID?: string; error?: string }> {
    // Construct XML data
    const xml = `<?xml version="1.0"?>
<mainbody>
  <header>
    <usercode>${this.username}</usercode>
    <password>${this.password}</password>
    <msgheader>${this.msgheader}</msgheader>
    <appkey>${this.appkey}</appkey>
  </header>
  <body>
    <msg><![CDATA[${message}]]></msg>
    <no>${phone}</no>
  </body>
</mainbody>`

    const url = 'https://api.netgsm.com.tr/sms/send/otp'

    const resultXml = await this.xmlPost(url, xml)

    // Basit XML parse işlemi için RegExp (daha karmaşık için xml2js kullanılabilir)
    const codeMatch = resultXml.match(/<code>(\d+)<\/code>/)
    const jobIDMatch = resultXml.match(/<jobID>([^<]+)<\/jobID>/)
    const errorMatch = resultXml.match(/<error>([^<]+)<\/error>/)

    const code = codeMatch ? parseInt(codeMatch[1], 10) : -1
    const jobID = jobIDMatch ? jobIDMatch[1] : undefined
    const error = errorMatch ? errorMatch[1] : undefined

    return { code, jobID, error }
  }
}
