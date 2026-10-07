import React, { useState } from 'react'
import type { Business } from '../App'
import { AGREEMENT_TITLE, AGREEMENT_ROWS } from '../data/agreementTemplate'
import { AGREEMENT_TITLE_MONO, MONO_PARAGRAPHS } from '../data/monoAgreementTemplate'
import {
  getAgreementValues,
  downloadAgreementDocx,
  downloadBothAgreementsDocx,
  generateAgreementDocx,
  blobToBase64,
} from '../utils/docxGenerator'

interface AgreementModalProps {
  b: Business
  lang: 'id' | 'en'
  onClose: () => void
  scriptUrl?: string
  user?: { name: string; email: string; role: string }
  onUpdateAgreementLink?: (businessId: string, link: string) => void
}

export function AgreementModal({
  b,
  lang,
  onClose,
  scriptUrl,
  user,
  onUpdateAgreementLink,
}: AgreementModalProps) {
  const isMcMono = b.hardware === 'MC + MONO'
  const [activeKitTab, setActiveKitTab] = useState<'MC' | 'MONO'>('MC')
  const [viewMode, setViewMode] = useState<'bilingual' | 'id' | 'en'>('bilingual')
  const [isDownloading, setIsDownloading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [highlightTags, setHighlightTags] = useState(true)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const vals = getAgreementValues(b)
  const isMono = isMcMono ? activeKitTab === 'MONO' : b.hardware === 'MONO'
  const activeTitle = isMono ? AGREEMENT_TITLE_MONO : AGREEMENT_TITLE
  const currentRate = isMono ? (b.rateMono || b.rate || 0) : (b.rateMc || b.rate || 0)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4500)
  }

  // Handle Download Word .docx
  const handleDownloadDocx = async () => {
    setIsDownloading(true)
    try {
      if (isMcMono) {
        const { mcFileName, monoFileName } = await downloadBothAgreementsDocx(b)
        showToast(
          lang === 'id'
            ? `2 Dokumen Word (MC & MONO) berhasil diunduh:\n1. ${mcFileName}\n2. ${monoFileName}`
            : `Both Word documents downloaded:\n1. ${mcFileName}\n2. ${monoFileName}`,
          'success'
        )
      } else {
        const fileName = await downloadAgreementDocx(b)
        showToast(
          lang === 'id'
            ? `File Word berhasil diunduh: ${fileName}`
            : `Word document downloaded: ${fileName}`,
          'success'
        )
      }
    } catch (err: any) {
      console.error('Docx download failed:', err)
      showToast(
        lang === 'id'
          ? `Gagal mengunduh file Word: ${err?.message || err}`
          : `Failed to download Word document: ${err?.message || err}`,
        'error'
      )
    } finally {
      setIsDownloading(false)
    }
  }

  // Handle Download single active tab
  const handleDownloadActiveDocx = async () => {
    setIsDownloading(true)
    try {
      const fileName = await downloadAgreementDocx(b, isMcMono ? activeKitTab : undefined)
      showToast(
        lang === 'id'
          ? `File Word ${activeKitTab} berhasil diunduh: ${fileName}`
          : `Word document (${activeKitTab}) downloaded: ${fileName}`,
        'success'
      )
    } catch (err: any) {
      console.error('Docx download failed:', err)
      showToast(
        lang === 'id'
          ? `Gagal mengunduh file Word: ${err?.message || err}`
          : `Failed to download Word document: ${err?.message || err}`,
        'error'
      )
    } finally {
      setIsDownloading(false)
    }
  }

  // Handle Print / PDF
  const handlePrint = () => {
    window.print()
  }

  // Handle Save / Archive to Google Drive
  const handleSaveToDrive = async () => {
    if (!scriptUrl) {
      showToast(
        lang === 'id'
          ? 'URL Google Apps Script belum dikonfigurasi'
          : 'Google Apps Script URL is not configured',
        'error'
      )
      return
    }

    setIsUploading(true)
    try {
      if (isMcMono) {
        // Upload MC document
        const mcDoc = await generateAgreementDocx(b, 'MC')
        const mcBase64 = await blobToBase64(mcDoc.blob)
        const mcRes = await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'upload_file',
            folderType: 'agreement',
            fileName: mcDoc.fileName,
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            fileData: mcBase64,
            businessName: b.businessName,
            sdrName: b.sdrName,
            actor: user ? { name: user.name, email: user.email, role: user.role } : undefined,
          }),
        })
        const mcResult = await mcRes.json()
        const mcLink = mcResult?.agreementLink || mcResult?.url || ''

        // Upload MONO document
        const monoDoc = await generateAgreementDocx(b, 'MONO')
        const monoBase64 = await blobToBase64(monoDoc.blob)
        const monoRes = await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'upload_file',
            folderType: 'agreement',
            fileName: monoDoc.fileName,
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            fileData: monoBase64,
            businessName: b.businessName,
            sdrName: b.sdrName,
            appendAgreementLink: true,
            actor: user ? { name: user.name, email: user.email, role: user.role } : undefined,
          }),
        })
        const monoResult = await monoRes.json()
        const monoLink = monoResult?.agreementLink || monoResult?.url || ''

        const combinedLinks = [mcLink, monoLink].filter(Boolean).join('\n')
        if (combinedLinks && onUpdateAgreementLink) {
          onUpdateAgreementLink(b.id, combinedLinks)
        }

        showToast(
          lang === 'id'
            ? 'Kedua dokumen Agreement (MC & MONO) berhasil diarsipkan ke Google Drive!'
            : 'Both MC & MONO agreement documents archived to Google Drive successfully!',
          'success'
        )
      } else {
        const { blob, fileName } = await generateAgreementDocx(b)
        const base64Data = await blobToBase64(blob)

        const payload = {
          action: 'upload_file',
          folderType: 'agreement',
          fileName,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          fileData: base64Data,
          businessName: b.businessName,
          sdrName: b.sdrName,
          actor: user ? { name: user.name, email: user.email, role: user.role } : undefined,
        }

        const res = await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        })
        const result = await res.json()

        if (result && (result.agreementLink || result.url)) {
          const link = result.agreementLink || result.url
          if (onUpdateAgreementLink) {
            onUpdateAgreementLink(b.id, link)
          }
          showToast(
            lang === 'id'
              ? 'Dokumen Agreement berhasil diarsipkan ke Google Drive!'
              : 'Agreement document archived to Google Drive successfully!',
            'success'
          )
        } else {
          throw new Error(result?.error || 'Gagal menyimpan ke Google Drive')
        }
      }
    } catch (err: any) {
      console.error('Drive upload failed:', err)
      showToast(
        lang === 'id'
          ? `Gagal menyimpan ke Google Drive: ${err?.message || err}`
          : `Failed to save to Google Drive: ${err?.message || err}`,
        'error'
      )
    } finally {
      setIsUploading(false)
    }
  }

  // Function to replace tags and optionally highlight them
  const renderFormattedText = (rawText: string) => {
    if (!rawText) return null

    // Placeholder regex mapping
    const tagValues: Record<string, string> = {
      '{{Submission-Date}}': vals.submissionDate,
      '{{Submission-Date}': vals.submissionDate,
      '{{Business-Name}}': vals.businessName,
      '{{Full-Address}}': vals.fullAddress,
      '{{Target-Hours}}': vals.targetHours,
      '{{Kit-Quantity}}': vals.kitQuantity,
      '{{Account-Holder-Name}}': vals.accountHolderName,
      '{{Title}}': vals.title,
      '{{Email}}': vals.email,
      '{{EMAIL}}': vals.email,
    }

    const regex = /\{\{(?:Submission-Date\}?|Business-Name|Full-Address|Target-Hours|Kit-Quantity|Account-Holder-Name|Title|Email)\}\}/g

    // Check if there are any tags
    const parts = []
    let lastIdx = 0
    let match: RegExpExecArray | null

    // Also support {Submission-Date} without closing brace if present
    const combinedRegex = /(\{\{(?:Business-Name|Full-Address|Target-Hours|Kit-Quantity|Account-Holder-Name|Title|Submission-Date|Email|EMAIL)\}\}|\{\{Submission-Date\})/g

    while ((match = combinedRegex.exec(rawText)) !== null) {
      const matchStart = match.index
      const matchStr = match[0]

      if (matchStart > lastIdx) {
        parts.push(rawText.slice(lastIdx, matchStart))
      }

      const val = tagValues[matchStr] || matchStr

      if (highlightTags) {
        parts.push(
          <span
            key={matchStart}
            className="font-bold text-blue-700 bg-blue-50/90 px-1.5 py-0.5 rounded border border-blue-200/80 mx-0.5 print:bg-transparent print:border-none print:p-0 print:m-0 print:text-black print:font-semibold"
          >
            {val}
          </span>
        )
      } else {
        parts.push(
          <strong key={matchStart} className="font-semibold text-slate-900 print:text-black">
            {val}
          </strong>
        )
      }

      lastIdx = matchStart + matchStr.length
    }

    if (lastIdx < rawText.length) {
      parts.push(rawText.slice(lastIdx))
    }

    return parts.length > 0 ? parts : rawText
  }

  return (
    <div className="print-modal-container fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="print-modal-card bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-4 overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal Top Toolbar (Hidden when printing) */}
        <div className="no-print px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              DOC
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-slate-900 font-sans tracking-tight">
                  {lang === 'id' ? 'Dokumen Perjanjian Kerjasama (Agreement)' : 'Pilot Agreement Document'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-100 text-blue-800">
                  {b.businessName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-slate-200 text-slate-800">
                  Kit: {b.hardware || 'MC'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                {b.city || 'Tangerang'} · {b.hours} hrs · {b.quantity} device · SDR: {b.sdrName}
                {isMcMono && ` · MC: $${b.rateMc || b.rate}/hr | MONO: $${b.rateMono || b.rate}/hr`}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Switcher (for MC) or Mono English indicator */}
            {!isMono ? (
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setViewMode('bilingual')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    viewMode === 'bilingual'
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang === 'id' ? 'Bilingual (2 Kolom)' : 'Bilingual'}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('id')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    viewMode === 'id'
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Indonesia
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('en')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    viewMode === 'en'
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  English
                </button>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>English (Official Mono Agreement)</span>
              </div>
            )}

            {/* Toggle Highlight */}
            <button
              type="button"
              onClick={() => setHighlightTags(!highlightTags)}
              className={`px-2 py-1 rounded-lg border text-xs font-medium transition-colors ${
                highlightTags
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title={lang === 'id' ? 'Sorot data yang terisi otomatis' : 'Highlight filled values'}
            >
              {highlightTags ? (lang === 'id' ? 'Sorotan ON' : 'Highlight ON') : (lang === 'id' ? 'Sorotan OFF' : 'Highlight OFF')}
            </button>

            {/* Download Word (.docx) */}
            <button
              type="button"
              disabled={isDownloading}
              onClick={handleDownloadDocx}
              className="py-1.5 px-3 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              title={lang === 'id' ? (isMcMono ? 'Unduh 2 file Word (MC & MONO)' : 'Unduh file Microsoft Word (.docx)') : (isMcMono ? 'Download both Word files (MC & MONO)' : 'Download Microsoft Word (.docx)')}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>{isDownloading ? (lang === 'id' ? 'Mengunduh...' : 'Downloading...') : (isMcMono ? (lang === 'id' ? 'Unduh 2 .docx (MC + MONO)' : 'Download 2 .docx') : 'Unduh .docx')}</span>
            </button>

            {isMcMono && (
              <button
                type="button"
                disabled={isDownloading}
                onClick={handleDownloadActiveDocx}
                className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium inline-flex items-center gap-1 border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
                title={`Unduh file ${activeKitTab} saja`}
              >
                <span>Hanya {activeKitTab}</span>
              </button>
            )}

            {/* Print / Save PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title={lang === 'id' ? 'Cetak atau Simpan PDF' : 'Print or Save PDF'}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>{lang === 'id' ? 'Cetak / PDF' : 'Print / PDF'}</span>
            </button>

            {/* Save to Drive */}
            {scriptUrl && (
              <button
                type="button"
                disabled={isUploading}
                onClick={handleSaveToDrive}
                className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                title={lang === 'id' ? (isMcMono ? 'Arsipkan kedua dokumen (MC & MONO) ke Google Drive' : 'Arsipkan salinan .docx ke Google Drive') : (isMcMono ? 'Archive both documents (MC & MONO) to Drive' : 'Archive .docx to Google Drive')}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                <span>{isUploading ? (lang === 'id' ? 'Menyimpan...' : 'Saving...') : (isMcMono ? (lang === 'id' ? 'Simpan 2 ke Drive' : 'Save Both to Drive') : 'Simpan Drive')}</span>
              </button>
            )}

            {/* Existing Drive Link */}
            {b.agreementLink && (
              b.agreementLink.includes('\n') ? (
                b.agreementLink.split('\n').filter(Boolean).map((link, idx) => (
                  <a
                    key={idx}
                    href={link.trim()}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-2 bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                    title={lang === 'id' ? `Buka dokumen ${idx === 0 ? 'MC' : 'MONO'} di Drive` : `Open ${idx === 0 ? 'MC' : 'MONO'} doc in Drive`}
                  >
                    <span>Drive {idx === 0 ? 'MC' : 'MONO'} ↗</span>
                  </a>
                ))
              ) : (
                <a
                  href={b.agreementLink}
                  target="_blank"
                  rel="noreferrer"
                  className="py-1.5 px-2.5 bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                  title={lang === 'id' ? 'Buka dokumen yang tersimpan di Google Drive' : 'Open archived document in Drive'}
                >
                  <span>Drive ↗</span>
                </a>
              )
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 text-sm font-bold transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* MC + MONO Kit Switcher Bar */}
        {isMcMono && (
          <div className="no-print px-5 py-2.5 bg-blue-50/90 border-b border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-blue-950">Kit MC + MONO (2 Dokumen):</span>
              <div className="inline-flex rounded-lg border border-blue-300 bg-white p-0.5 text-xs font-semibold shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActiveKitTab('MC')}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeKitTab === 'MC'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-semibold">Agreement MC</span>
                  <span className="text-[10px] font-mono font-bold bg-blue-500/30 px-1 rounded">${b.rateMc || b.rate}/hr</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveKitTab('MONO')}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeKitTab === 'MONO'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-semibold">Agreement MONO</span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/30 px-1 rounded">${b.rateMono || b.rate}/hr</span>
                </button>
              </div>
            </div>
            <div className="text-[11px] text-blue-800 font-mono flex items-center gap-1.5">
              <span>Menampilkan:</span>
              <span className="font-bold underline decoration-blue-400">Agreement {activeKitTab} (${currentRate}/hr)</span>
            </div>
          </div>
        )}

        {/* Toast Alert */}
        {toast && (
          <div
            className={`no-print px-4 py-2.5 text-xs font-medium flex items-center justify-between border-b ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <span className="whitespace-pre-line">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-xs font-bold opacity-70 hover:opacity-100 px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Kit Specific Template Notice */}
        {isMcMono ? (
          <div className="no-print px-5 py-2.5 bg-blue-50 border-b border-blue-200 text-blue-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-700">Dual Agreement Kit MC + MONO:</span>
              <span>
                {lang === 'id'
                  ? `Bisnis ini membuat 2 dokumen agreement: Kit MC (Rate: $${b.rateMc || b.rate}/hr) dan Kit MONO (Rate: $${b.rateMono || b.rate}/hr).`
                  : `This business generates 2 agreement documents: Kit MC (Rate: $${b.rateMc || b.rate}/hr) and Kit MONO (Rate: $${b.rateMono || b.rate}/hr).`}
              </span>
            </div>
            <span className="text-[10px] font-mono font-semibold bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 rounded shrink-0 self-start sm:self-auto">
              {activeKitTab === 'MC' ? 'template-agreement.docx' : 'template-agreement-mono.docx'}
            </span>
          </div>
        ) : isMono ? (
          <div className="no-print px-5 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-700">Template Kit MONO:</span>
              <span>
                {lang === 'id'
                  ? 'Menggunakan template resmi Business Capture — Single-Camera (Mono).'
                  : 'Using official template for Business Capture — Single-Camera (Mono).'}
              </span>
            </div>
            <span className="text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded shrink-0 self-start sm:self-auto">
              template-agreement-mono.docx
            </span>
          </div>
        ) : b.hardware && b.hardware !== 'MC' && b.hardware !== 'MC + MONO' ? (
          <div className="no-print px-5 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-700">ℹ️ Catatan Kit:</span>
              <span>
                {lang === 'id'
                  ? `Bisnis ini menggunakan Kit ${b.hardware}. Template khusus belum diunggah, dokumen menggunakan format dasar Multicam (MC).`
                  : `This business uses Kit ${b.hardware}. Custom template not uploaded, using default Multicam (MC) format.`}
              </span>
            </div>
            <span className="text-[10px] font-mono font-semibold bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded shrink-0 self-start sm:self-auto">
              Fallback: MC Template
            </span>
          </div>
        ) : null}

        {/* Paper Document Preview Area */}
        <div className="print-sheet flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/60 font-serif text-slate-800 selection:bg-blue-100">
          <div className="max-w-4xl mx-auto bg-white p-6 sm:p-12 rounded-xl shadow-md border border-slate-200/80 print:shadow-none print:border-none print:p-0">
            {/* Document Header */}
            <div className="text-center mb-8 pb-4 border-b-2 border-slate-900 print:border-black">
              <h3 className="text-sm font-bold tracking-widest uppercase text-slate-600 print:text-black font-sans mb-1">
                {activeTitle.org}
              </h3>
              <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-slate-900 print:text-black font-serif mb-1">
                {activeTitle.main}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-600 print:text-black font-serif italic">
                {activeTitle.sub}
              </p>
            </div>

            {isMono ? (
              /* MONO Document Sequential Section Layout */
              <div className="space-y-3.5 text-xs sm:text-[13px] leading-relaxed text-slate-800">
                {MONO_PARAGRAPHS.slice(0, 48).map((p, idx) => {
                  if (p.isHeading) {
                    return (
                      <h4
                        key={idx}
                        className="font-bold text-sm text-slate-900 font-sans pt-4 pb-1 border-b border-slate-200 print:border-black"
                      >
                        {renderFormattedText(p.text)}
                      </h4>
                    )
                  }
                  return (
                    <p key={idx} className="leading-relaxed text-justify">
                      {renderFormattedText(p.text)}
                    </p>
                  )
                })}

                {/* IN WITNESS WHEREOF */}
                <p className="italic font-semibold text-slate-900 pt-6">
                  {renderFormattedText(MONO_PARAGRAPHS[48]?.text || 'IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.')}
                </p>

                {/* Signature Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 pb-4 border-t border-slate-300 print:border-black font-sans text-xs">
                  <div className="space-y-2">
                    <p className="font-bold text-slate-900 text-sm">ATLAS CAPTURE LLC</p>
                    <div className="pt-8 pb-1">
                      <p className="text-slate-400 font-mono">By: ____________________________________</p>
                    </div>
                    <p><span className="text-slate-500">Name:</span> <strong className="text-slate-900">Parshan Nasari</strong></p>
                    <p><span className="text-slate-500">Title:</span> <strong className="text-slate-900">Head of Atlas Capture</strong></p>
                    <p><span className="text-slate-500">Date:</span> {renderFormattedText('{{Submission-Date}}')}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-slate-900 text-sm">VENDOR: {renderFormattedText('{{Business-Name}}')}</p>
                    <div className="pt-8 pb-1">
                      <p className="text-slate-400 font-mono">By: ____________________________________</p>
                    </div>
                    <p><span className="text-slate-500">Name:</span> {renderFormattedText('{{Account-Holder-Name}}')}</p>
                    <p><span className="text-slate-500">Title:</span> {renderFormattedText('{{Title}}')}</p>
                    <p><span className="text-slate-500">Date:</span> {renderFormattedText('{{Submission-Date}}')}</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Document Table Rows for MC */
              <div className="border border-slate-300 print:border-black rounded-lg overflow-hidden">
                <table className="w-full text-xs sm:text-[13px] border-collapse leading-relaxed">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-300 print:bg-slate-200 print:border-black font-sans text-xs">
                      {(viewMode === 'bilingual' || viewMode === 'en') && (
                        <th className={`p-3 text-left font-bold text-slate-800 print:text-black ${viewMode === 'bilingual' ? 'w-1/2 border-r border-slate-300 print:border-black' : 'w-full'}`}>
                          ENGLISH
                        </th>
                      )}
                      {(viewMode === 'bilingual' || viewMode === 'id') && (
                        <th className={`p-3 text-left font-bold text-slate-800 print:text-black ${viewMode === 'bilingual' ? 'w-1/2' : 'w-full'}`}>
                          BAHASA INDONESIA
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 print:divide-black">
                    {AGREEMENT_ROWS.map((row, idx) => {
                      const isSectionHeader = /^[0-9]+\.\s+[A-Z\s]+$/.test(row.en.trim())
                      const isSignatureHeader = row.en.includes('IN WITNESS WHEREOF') || row.en === 'ATLAS CAPTURE LLC' || row.en === 'By / Oleh:'

                      return (
                        <tr
                          key={idx}
                          className={`${
                            isSectionHeader
                              ? 'bg-slate-50 font-bold font-sans text-[11px] sm:text-xs print:bg-slate-100'
                              : isSignatureHeader
                              ? 'bg-slate-50/50 print:bg-transparent font-medium'
                              : 'hover:bg-blue-50/20 print:hover:bg-transparent'
                          }`}
                        >
                          {(viewMode === 'bilingual' || viewMode === 'en') && (
                            <td
                              className={`p-3 align-top ${
                                viewMode === 'bilingual'
                                  ? 'w-1/2 border-r border-slate-200 print:border-black'
                                  : 'w-full'
                              } ${isSectionHeader ? 'font-bold uppercase tracking-wider text-slate-900' : ''}`}
                            >
                              {renderFormattedText(row.en)}
                            </td>
                          )}
                          {(viewMode === 'bilingual' || viewMode === 'id') && (
                            <td
                              className={`p-3 align-top ${
                                viewMode === 'bilingual' ? 'w-1/2' : 'w-full'
                              } ${isSectionHeader ? 'font-bold uppercase tracking-wider text-slate-900' : ''}`}
                            >
                              {renderFormattedText(row.id)}
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Document Footer Note */}
            <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 print:text-slate-600 font-sans flex items-center justify-between">
              <span>Atlas Capture LLC — Tangerang Pilot Project</span>
              <span>Official Agreement Document</span>
              <span>Ref: {b.businessName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
