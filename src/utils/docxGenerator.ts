import JSZip from 'jszip'
import type { Business } from '../App'

export interface AgreementDataValues {
  submissionDate: string
  businessName: string
  fullAddress: string
  targetHours: string
  kitQuantity: string
  accountHolderName: string
  title: string
  email: string
}

export function getAgreementValues(b: Business): AgreementDataValues {
  const subDate = (b.submissionDate || new Date().toISOString().split('T')[0]).trim()
  const bizName = (b.businessName || 'Business').trim()

  let fullAddr = (b.fullAddress || '').trim()
  if (b.city && !fullAddr.toLowerCase().includes(b.city.toLowerCase())) {
    fullAddr += (fullAddr ? ', ' : '') + b.city
  }
  if (b.postalCode && !fullAddr.includes(b.postalCode.toString())) {
    fullAddr += ' ' + b.postalCode
  }
  if (!fullAddr) {
    fullAddr = b.city || 'Indonesia'
  }

  const titleVal =
    (b.title || '').trim() ||
    ((b.accountType as string) === 'COMPANY' ||
    (b.accountType as string) === 'PT' ||
    (b.accountType as string) === 'CV'
      ? 'Direktur / Penanggung Jawab'
      : 'Owner / Pemilik')

  const holderVal = (b.accountHolderName || '').trim() || bizName

  return {
    submissionDate: subDate,
    businessName: bizName,
    fullAddress: fullAddr,
    targetHours: (b.hours || 0).toString(),
    kitQuantity: (b.quantity || 1).toString(),
    accountHolderName: holderVal,
    title: titleVal,
    email: (b.email || '').trim() || '—',
  }
}

export function escapeXml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function getTemplateUrlForHardware(hardware?: string): string {
  const norm = (hardware || 'MC').trim().toLowerCase().replace(/[\s\-_]/g, '')
  if (norm === 'mono') {
    return '/template-agreement-mono.docx'
  }
  if (norm === 'egoexo' || norm === 'ego' || norm === 'exo') {
    return '/template-agreement-egoexo.docx'
  }
  return '/template-agreement.docx'
}

export async function generateAgreementDocx(
  b: Business,
  targetHardware?: 'MC' | 'MONO'
): Promise<{ blob: Blob; fileName: string }> {
  // If business is MC + MONO, use targetHardware if provided or default to MC
  const effectiveHw = targetHardware || (b.hardware === 'MC + MONO' ? 'MC' : b.hardware)
  const preferredUrl = getTemplateUrlForHardware(effectiveHw)
  let res = await fetch(preferredUrl)
  if (!res.ok && preferredUrl !== '/template-agreement.docx') {
    // Fallback to default template (MC) if kit-specific template is not uploaded yet
    res = await fetch('/template-agreement.docx')
  }
  if (!res.ok) {
    throw new Error('Gagal memuat template Word agreement (public/template-agreement.docx).')
  }
  const arrayBuffer = await res.arrayBuffer()
  const zip = await JSZip.loadAsync(arrayBuffer)

  const docXmlFile = zip.file('word/document.xml')
  if (!docXmlFile) {
    throw new Error('Format template docx tidak valid (word/document.xml tidak ditemukan).')
  }

  let xml = await docXmlFile.async('text')

  const vals = getAgreementValues(b)
  const effectiveRate =
    effectiveHw === 'MONO'
      ? (b.rateMono || b.rate || 0)
      : (b.rateMc || b.rate || 0)

  const replacements: Record<string, string> = {
    '{{Submission-Date}}': escapeXml(vals.submissionDate),
    '{{Submission-Date}': escapeXml(vals.submissionDate),
    '{{Business-Name}}': escapeXml(vals.businessName),
    '{{Full-Address}}': escapeXml(vals.fullAddress),
    '{{Target-Hours}}': escapeXml(vals.targetHours),
    '{{Kit-Quantity}}': escapeXml(vals.kitQuantity),
    '{{Account-Holder-Name}}': escapeXml(vals.accountHolderName),
    '{{Title}}': escapeXml(vals.title),
    '{{Email}}': escapeXml(vals.email),
    '{{EMAIL}}': escapeXml(vals.email),
    '{{Rate}}': escapeXml(String(effectiveRate)),
    '{{RATE}}': escapeXml(String(effectiveRate)),
    '{{Hardware}}': escapeXml(effectiveHw),
    '{{HARDWARE}}': escapeXml(effectiveHw),
  }

  for (const [tag, val] of Object.entries(replacements)) {
    xml = xml.split(tag).join(val)
  }

  zip.file('word/document.xml', xml)

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE',
  })

  let fileName = `Agreement - ${vals.businessName} - ${vals.submissionDate}.docx`
  if (b.hardware === 'MC + MONO' || targetHardware) {
    fileName = `Agreement ${effectiveHw} - ${vals.businessName} - ${vals.submissionDate}.docx`
  }
  return { blob, fileName }
}

export async function downloadAgreementDocx(
  b: Business,
  targetHardware?: 'MC' | 'MONO'
): Promise<string> {
  const { blob, fileName } = await generateAgreementDocx(b, targetHardware)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 1000)
  return fileName
}

export async function downloadBothAgreementsDocx(b: Business): Promise<{ mcFileName: string; monoFileName: string }> {
  const mcRes = await generateAgreementDocx(b, 'MC')
  const monoRes = await generateAgreementDocx(b, 'MONO')

  // Download MC
  const url1 = URL.createObjectURL(mcRes.blob)
  const a1 = document.createElement('a')
  a1.href = url1
  a1.download = mcRes.fileName
  document.body.appendChild(a1)
  a1.click()
  setTimeout(() => {
    document.body.removeChild(a1)
    URL.revokeObjectURL(url1)
  }, 1000)

  // Download MONO after small pause so browser does not block simultaneous downloads
  await new Promise(r => setTimeout(r, 600))

  const url2 = URL.createObjectURL(monoRes.blob)
  const a2 = document.createElement('a')
  a2.href = url2
  a2.download = monoRes.fileName
  document.body.appendChild(a2)
  a2.click()
  setTimeout(() => {
    document.body.removeChild(a2)
    URL.revokeObjectURL(url2)
  }, 1000)

  return { mcFileName: mcRes.fileName, monoFileName: monoRes.fileName }
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result as string
      const base64 = (dataUrl || '').split(',')[1] || ''
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
