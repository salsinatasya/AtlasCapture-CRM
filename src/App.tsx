import React, { useState, useEffect, useMemo, useRef } from 'react'
import Papa from 'papaparse'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts'
import { Logo } from './components/Logo'

// ─── SVG Icons ───────────────────────────────────────────────────────────────

function IconDashboard({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  )
}

function IconBuilding({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.75a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21" />
    </svg>
  )
}

function IconUsers({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  )
}

function IconShootReport({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
  )
}

function IconApprovals({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function IconSettings({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function IconCamera({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
  )
}

function IconTrash({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}

function IconRefresh({ className = "w-4 h-4", spinning = false }: { className?: string; spinning?: boolean }) {
  return (
    <svg className={`${className} ${spinning ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  )
}

function IconShieldCheck({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  )
}

function IconBolt({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  )
}

function IconCalendar({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  )
}

// ─── Date Parsing & Utilities ────────────────────────────────────────────────

export function parseAnyDate(dStr?: string): Date | null {
  if (!dStr) return null
  const str = dStr.trim()
  // Match DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10)
    const month = parseInt(dmyMatch[2], 10) - 1
    const year = parseInt(dmyMatch[3], 10)
    return new Date(year, month, day)
  }
  // Match YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/)
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10)
    const month = parseInt(ymdMatch[2], 10) - 1
    const day = parseInt(ymdMatch[3], 10)
    return new Date(year, month, day)
  }
  const parsed = new Date(str)
  return isNaN(parsed.getTime()) ? null : parsed
}

export function formatDateDisplay(dateObj?: Date | null, lang: Language = 'id'): string {
  if (!dateObj || isNaN(dateObj.getTime())) return '—'
  return dateObj.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// ─── Internationalization (ID / EN) ──────────────────────────────────────────

export type Language = 'id' | 'en'

export const TRANSLATIONS = {
  id: {
    portalName: 'CRM Tangerang',
    portalSub: 'Operations Portal',
    navDashboard: 'Dashboard',
    navBusinesses: 'Semua Bisnis',
    navSdr: 'Direktori SDR',
    navShootReport: 'Shoot Report',
    navApprovals: 'Permintaan Approval',
    navTeamManage: 'Kelola Tim & Role',
    logout: 'Keluar',
    settings: 'Pengaturan Akun',
    langSelect: 'Bahasa',
    dashTitle: 'Dashboard Operasional',
    dashSub: 'Ringkasan & Analisis Operasional CRM Tangerang',
    totalBusinesses: 'Total Bisnis Terdaftar',
    runningBusinesses: 'Bisnis Running (Aktif)',
    allEntries: 'Semua entri bisnis',
    activeOnly: 'Status Running & Approved',
    runningBizPerMonth: 'Tren Bisnis Running per Bulan',
    runningBizSub: 'Pertumbuhan bisnis yang sedang aktif running / approved per bulan',
    hardwareDistribution: 'Distribusi Tipe Hardware / Kit',
    recentBusinesses: 'Bisnis Terbaru',
    allBizTitle: 'Semua Bisnis',
    entriesCount: (filtered: number, total: number) => `Menampilkan ${filtered} dari ${total} entri bisnis`,
    addBusiness: '+ Tambah Bisnis',
    searchPlaceholder: 'Cari nama bisnis, kota, atau SDR...',
    allSdrs: 'Semua SDR',
    allStatuses: 'Semua Status',
    clearFilters: 'Reset Filter',
    editPending: 'Menunggu Persetujuan',
    thBizName: 'Nama Bisnis',
    thSdr: 'SDR In-Charge',
    thDate: 'Tanggal Pengajuan',
    thHours: 'Target Jam',
    thHardware: 'Tipe Kit',
    thRate: 'Rate ($/hr)',
    thCity: 'Kota',
    thPhone: 'Nomor Telepon',
    thStatus: 'Status CRM',
    thShootProgress: 'Progress Shoot',
    thActions: 'Aksi',
    noBizFound: 'Tidak ada data bisnis yang sesuai dengan filter pencarian.',
    modalAddTitle: 'Tambah Bisnis Baru',
    modalEditTitle: 'Edit Data Bisnis',
    sdrApprovalWarning: 'Perubahan data selain status akan berstatus "Pending" dan membutuhkan persetujuan Sales Manager / Coordinator / Field Ops.',
    secBizInfo: 'Informasi Bisnis & Target Hardware',
    secContact: 'Kontak & Alamat Lokasi',
    secBank: 'Rincian Rekening Bank',
    secDocs: 'Dokumen & Tautan Terkait',
    cancel: 'Batal',
    saveChanges: 'Simpan Perubahan',
    submitApproval: 'Kirim Permintaan Edit (Pending)',
    updatingData: 'Menyimpan data...',
    uploadingKtp: 'Mengunggah foto KTP...',
    uploadedKtpSuccess: 'Foto KTP berhasil diunggah.',
    profileSettings: 'Pengaturan Profil & Keamanan',
    tabProfile: 'Profil Pengguna',
    tabPassword: 'Ganti Password',
    changePhoto: 'Ganti Foto Profil',
    uploadPhotoBtn: 'Unggah Foto',
    removePhotoBtn: 'Hapus Foto',
    presetAvatarTitle: 'Pilih Avatar Bawaan:',
    fullName: 'Nama Lengkap',
    roleAccess: 'Role Akses',
    dedicatedSdrTitle: 'SDR Dedicated',
    dedicatedSdrHelp: 'Penetapan Dedicated SDR hanya dapat dikonfigurasi oleh Sales Manager.',
    saveProfileBtn: 'Perbarui Profil',
    oldPass: 'Password Lama',
    newPass: 'Password Baru',
    confirmPass: 'Konfirmasi Password Baru',
    changePassBtn: 'Simpan Password Baru',
    processing: 'Memproses...',
    approvalsTitle: 'Permintaan Persetujuan (Approval)',
    approvalsSub: 'Tinjau dan verifikasi perubahan data bisnis yang diajukan oleh SDR.',
    pendingCount: 'Menunggu Persetujuan',
    needsReview: 'Perlu ditinjau',
    totalRequests: 'Total Permintaan',
    allRequests: 'Semua riwayat pengajuan',
    queueTitle: 'Daftar Antrean Permintaan Edit (Pending)',
    noPendingReqs: 'Tidak ada permintaan edit yang menunggu persetujuan.',
    reviewChanges: 'Tinjau Perubahan Data',
    diffNote: 'Berikut adalah perbandingan antara data tersimpan dan perubahan yang diajukan.',
    approveAndApply: 'Setujui & Perbarui Status Menjadi Approved',
    rejectRequest: 'Tolak Permintaan',
    confirmReject: 'Konfirmasi Penolakan',
    rejectReasonPrompt: 'Alasan Penolakan (Opsional)',
    shootTitle: 'Shoot Report',
    shootSub: 'Kit shooting progress per-businesses',
    totalKits: 'Total Kit Terdaftar',
    totalLoggedShoot: 'Total Jam Shoot',
    utilizationRate: 'Rata-rata Utilisasi',
    maximalCount: 'Bisnis Maksimal (≥90%)',
    targetHours: 'Target Jam',
    loggedHours: 'Jam Shoot Aktual',
    utilization: 'Tingkat Utilisasi',
    statusMaksimal: 'Maksimal',
    statusOptimal: 'Optimal',
    statusBerjalan: 'Sedang Berjalan',
    statusBelumMaksimal: 'Belum Ada Log',
    statusStopped: 'Stopped (Tidak Ada Report Terbaru)',
    historyLogs: 'Riwayat Log Shoot',
    noLogs: 'Belum ada log jam shoot yang tercatat.',
    deleteConfirm: (name: string) => `Apakah Anda yakin ingin menghapus bisnis "${name}"? Data di Google Spreadsheet dan file KTP di Google Drive akan dihapus secara permanen.`,
    deleteSuccess: 'Bisnis berhasil dihapus dari Spreadsheet dan Google Drive.',
    saveSuccess: 'Data berhasil disimpan dan disinkronkan ke Google Spreadsheet.',
    updateProfileSuccess: 'Profil Anda berhasil diperbarui.',
    statusUpdated: 'Status bisnis berhasil diperbarui di Google Spreadsheet.',
    manageTeamTitle: 'Pengelolaan Tim & Role Pengguna',
    manageTeamSub: 'Khusus Sales Manager: Konfigurasi hak akses role dan Dedicated SDR.',
    onlyManagerCanChangeRole: 'Hanya Sales Manager yang memiliki wewenang untuk mengubah role pengguna.',
    
    // Status Synchronization Translations
    syncShootStatusBtn: '⚡ Sinkronkan Status dari Shoot Report',
    syncShootStatusTooltip: 'Mendeteksi bisnis yang sudah memiliki jam shoot dan mengubah statusnya menjadi Running di CRM & Spreadsheet',
    syncShootSuccess: (count: number) => `Berhasil menyinkronkan status ${count} bisnis menjadi "Running" di CRM dan Google Spreadsheet!`,
    syncShootNoChanges: 'Semua status bisnis dengan jam shoot aktif sudah berstatus Running.',
    syncingStatusText: 'Menyinkronkan status ke Google Spreadsheet...',
    syncBulkCrmBtn: '⚡ Sinkronkan Status Semua Bisnis Aktif ke Spreadsheet',
    syncRowBtn: 'Set Status Running',
    syncRowSuccess: (name: string) => `Status bisnis "${name}" berhasil diubah menjadi Running dan diperbarui di Spreadsheet!`,
    
    // Filter by Date
    filterDateRange: 'Filter Rentang Tanggal',
    filterStartDate: 'Dari Tanggal',
    filterEndDate: 'Sampai Tanggal',
    filterSingleDate: 'Pilih Tanggal',
    filterAllTime: 'Semua Waktu',
    filterToday: 'Hari Ini',
    filterThisWeek: 'Minggu Ini',
    filterThisMonth: 'Bulan Ini',
    filterLastMonth: 'Bulan Lalu',
    filterLast30Days: '30 Hari Terakhir',
    filterCustom: 'Rentang Tanggal',
    filterMonth: 'Pilih Bulan',
    allMonths: 'Semua Bulan',
    bizTotalKits: 'Jumlah Kit',
    bizTotalHours: 'Total Jam Ter-shoot',
    bizTotalVideos: 'Total Video',
    bizLastReport: 'Report Terakhir',
    bizNoReport: 'Belum Ada Report',
    viewOnlyBadge: 'Live Sheet Hours',
    totalKitAccumulated: 'Akumulasi Semua Kit',
    viewOnlyNotice: '',
    noShootLogsInPeriod: 'Tidak ada catatan shoot pada periode tanggal ini.',
    expandKits: 'Lihat Rincian Kit',
    collapseKits: 'Tutup Rincian Kit',

    // Detail Modal Labels
    detailSdrInCharge: 'SDR Penanggung Jawab',
    detailStatus: 'Status Bisnis',
    detailHardware: 'Tipe Hardware / Kit',
    detailTargetRate: 'Target Jam & Tarif',
    detailContactAddress: 'Kontak & Alamat Lokasi',
    detailAddress: 'Alamat',
    detailPhone: 'Telepon',
    detailEmail: 'Email',
    detailBankInfo: 'Informasi Rekening Bank',
    detailBankName: 'Nama Bank',
    detailAccNumber: 'Nomor Rekening',
    detailAccHolder: 'Nama Pemilik Rekening',
    detailAccType: 'Tipe Rekening',
    detailOwnerKtp: 'Dokumen KTP Pemilik',
    detailViewKtp: 'Lihat Foto KTP ↗',
    detailNoCity: 'Kota belum diisi',
    detailNoKtp: 'Belum ada dokumen KTP',
    detailShootSection: 'Aktivitas Shoot (Sheet Hours)',
    detailShootHours: 'Jam Shoot Aktual',
    detailShootVideos: 'Total Video',
    detailShootKits: 'Kit Terkait',

    // SDR Directory Labels
    sdrDirectoryTitle: 'Direktori SDR',
    sdrDirectorySub: 'Daftar SDR dan manajemen portofolio bisnis di Tangerang',
    sdrTotalBiz: 'Total Bisnis',
    sdrRunningBiz: 'Bisnis Running',
    sdrTotalShoot: 'Total Jam Shoot',
    sdrAvgRate: 'Rata-rata Rate',

    // Login & Auth
    loginTitle: 'CRM Tangerang Portal',
    loginSubWelcome: 'Silakan masuk dengan akun Anda untuk mengakses sistem',
    signupSubWelcome: 'Pendaftaran Akun Baru CRM Tangerang',
    loginBtn: 'Masuk ke Portal',
    signupBtn: 'Daftar Akun Baru',
    noAccountPrompt: 'Belum punya akun?',
    haveAccountPrompt: 'Sudah punya akun?',
    signUpNow: 'Daftar Sekarang',
    signInNow: 'Masuk',
    authSuccess: 'Autentikasi berhasil',
    authFailed: 'Email atau password tidak sesuai.'
  },
  en: {
    portalName: 'CRM Tangerang',
    portalSub: 'Operations Portal',
    navDashboard: 'Dashboard',
    navBusinesses: 'All Businesses',
    navSdr: 'SDR Directory',
    navShootReport: 'Shoot Report',
    navApprovals: 'Approval Requests',
    navTeamManage: 'Team & Roles',
    logout: 'Logout',
    settings: 'Account Settings',
    langSelect: 'Language',
    dashTitle: 'Operational Dashboard',
    dashSub: 'CRM Tangerang — operational metrics and real-time performance analytics',
    totalBusinesses: 'Total Businesses',
    runningBusinesses: 'Running Businesses',
    allEntries: 'All registered entries',
    activeOnly: 'Running & Approved status',
    runningBizPerMonth: 'Running Businesses Growth Trend',
    runningBizSub: 'Monthly growth trajectory of active running/approved businesses',
    hardwareDistribution: 'Hardware / Kit Type Distribution',
    recentBusinesses: 'Recent Businesses',
    allBizTitle: 'All Businesses',
    entriesCount: (filtered: number, total: number) => `Showing ${filtered} of ${total} business entries`,
    addBusiness: '+ Add Business',
    searchPlaceholder: 'Search by business name, city, or SDR...',
    allSdrs: 'All SDRs',
    allStatuses: 'All Statuses',
    clearFilters: 'Clear Filters',
    editPending: 'Pending Approval',
    thBizName: 'Business Name',
    thSdr: 'SDR In-Charge',
    thDate: 'Submission Date',
    thHours: 'Target Hours',
    thHardware: 'Kit Type',
    thRate: 'Rate ($/hr)',
    thCity: 'City',
    thPhone: 'Phone Number',
    thStatus: 'CRM Status',
    thShootProgress: 'Shoot Progress',
    thActions: 'Actions',
    noBizFound: 'No businesses found matching the filter criteria.',
    modalAddTitle: 'Add New Business',
    modalEditTitle: 'Edit Business Details',
    sdrApprovalWarning: 'Modifications other than status will be submitted as "Pending" and require Sales Manager / Coordinator / Field Ops approval.',
    secBizInfo: 'Business Information & Hardware Target',
    secContact: 'Contact & Location',
    secBank: 'Bank Account Information',
    secDocs: 'Documents & Verification Links',
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    submitApproval: 'Submit Edit Request (Pending)',
    updatingData: 'Saving changes...',
    uploadingKtp: 'Uploading KTP photo...',
    uploadedKtpSuccess: 'KTP photo uploaded successfully.',
    profileSettings: 'Profile & Security Settings',
    tabProfile: 'User Profile',
    tabPassword: 'Change Password',
    changePhoto: 'Change Profile Picture',
    uploadPhotoBtn: 'Upload Photo',
    removePhotoBtn: 'Remove Photo',
    presetAvatarTitle: 'Or Select a Preset Avatar:',
    fullName: 'Full Name',
    roleAccess: 'Role Access',
    dedicatedSdrTitle: 'Dedicated SDRs',
    dedicatedSdrHelp: 'Dedicated SDR assignments can only be configured by Sales Managers.',
    saveProfileBtn: 'Update Profile',
    oldPass: 'Current Password',
    newPass: 'New Password',
    confirmPass: 'Confirm New Password',
    changePassBtn: 'Save New Password',
    processing: 'Processing...',
    approvalsTitle: 'Approval Requests',
    approvalsSub: 'Review and verify business data modification requests submitted by SDRs.',
    pendingCount: 'Pending Review',
    needsReview: 'Requires attention',
    totalRequests: 'Total Requests',
    allRequests: 'All historical requests',
    queueTitle: 'Pending Edit Requests Queue',
    noPendingReqs: 'There are no pending edit requests at this time.',
    reviewChanges: 'Review Data Modifications',
    diffNote: 'Comparison between current registered data and proposed modifications.',
    approveAndApply: 'Approve & Set Status to Approved',
    rejectRequest: 'Reject Request',
    confirmReject: 'Confirm Rejection',
    rejectReasonPrompt: 'Reason for Rejection (Optional)',
    shootTitle: 'Shoot Report',
    shootSub: 'Kit shooting progress per-businesses',
    totalKits: 'Total Active Kits',
    totalLoggedShoot: 'Total Shoot Hours',
    utilizationRate: 'Average Utilization',
    maximalCount: 'Maximal Businesses (≥90%)',
    targetHours: 'Target Hours',
    loggedHours: 'Actual Shoot Hours',
    utilization: 'Utilization Rate',
    statusMaksimal: 'Maximal',
    statusOptimal: 'Optimal',
    statusBerjalan: 'In Progress',
    statusBelumMaksimal: 'No Logs Yet',
    statusStopped: 'Stopped (No Recent Report)',
    historyLogs: 'Shoot Log History',
    noLogs: 'No shooting records found for this business.',
    deleteConfirm: (name: string) => `Are you sure you want to delete business "${name}"? Data in Google Sheets and KTP files in Google Drive will be permanently removed.`,
    deleteSuccess: 'Business successfully deleted from Spreadsheet and Google Drive.',
    saveSuccess: 'Data successfully saved and synchronized to Google Spreadsheet.',
    updateProfileSuccess: 'Your profile has been updated successfully.',
    statusUpdated: 'Business status successfully updated in Google Spreadsheet.',
    manageTeamTitle: 'Team & Role Management',
    manageTeamSub: 'Sales Manager Exclusive: Configure user role permissions and Dedicated SDRs.',
    onlyManagerCanChangeRole: 'Only Sales Managers have authorization to modify user roles.',
    
    // Status Synchronization Translations
    syncShootStatusBtn: '⚡ Sync Status from Shoot Report',
    syncShootStatusTooltip: 'Detects businesses with logged shoot hours and automatically updates their status to Running in CRM & Google Sheets',
    syncShootSuccess: (count: number) => `Successfully synchronized ${count} business status(es) to "Running" in CRM and Google Sheets!`,
    syncShootNoChanges: 'All businesses with active shoot records are already set to Running.',
    syncingStatusText: 'Synchronizing status with Google Spreadsheet...',
    syncBulkCrmBtn: '⚡ Sync All Active Running Businesses to Spreadsheet',
    syncRowBtn: 'Set Status to Running',
    syncRowSuccess: (name: string) => `Status for "${name}" successfully updated to Running in Spreadsheet!`,
    
    // Filter by Date
    filterDateRange: 'Date Range Filter',
    filterStartDate: 'From Date',
    filterEndDate: 'To Date',
    filterSingleDate: 'Select Date',
    filterAllTime: 'All Time',
    filterToday: 'Today',
    filterThisWeek: 'This Week',
    filterThisMonth: 'This Month',
    filterLastMonth: 'Last Month',
    filterLast30Days: 'Last 30 Days',
    filterCustom: 'Date Range',
    filterMonth: 'Select Month',
    allMonths: 'All Months',
    bizTotalKits: 'Total Kits',
    bizTotalHours: 'Total Shoot Hours',
    bizTotalVideos: 'Total Videos',
    bizLastReport: 'Latest Report',
    bizNoReport: 'No Reports',
    viewOnlyBadge: 'Live Sheet Hours',
    totalKitAccumulated: 'Accumulated Across All Kits',
    viewOnlyNotice: '',
    noShootLogsInPeriod: 'No shoot logs found for this date range.',
    expandKits: 'View Kit Breakdown',
    collapseKits: 'Hide Kit Breakdown',

    // Detail Modal Labels
    detailSdrInCharge: 'SDR In-Charge',
    detailStatus: 'Business Status',
    detailHardware: 'Hardware / Kit Type',
    detailTargetRate: 'Target Hours & Rate',
    detailContactAddress: 'Contact & Location',
    detailAddress: 'Address',
    detailPhone: 'Phone',
    detailEmail: 'Email',
    detailBankInfo: 'Bank Account Information',
    detailBankName: 'Bank Name',
    detailAccNumber: 'Account Number',
    detailAccHolder: 'Account Holder Name',
    detailAccType: 'Account Type',
    detailOwnerKtp: 'Owner KTP Document',
    detailViewKtp: 'View KTP Photo ↗',
    detailNoCity: 'City not specified',
    detailNoKtp: 'No KTP document uploaded',
    detailShootSection: 'Shoot Activity (Sheet Hours)',
    detailShootHours: 'Logged Shoot Hours',
    detailShootVideos: 'Recorded Videos',
    detailShootKits: 'Assigned Kits',

    // SDR Directory Labels
    sdrDirectoryTitle: 'SDR Directory',
    sdrDirectorySub: 'SDR roster and managed business portfolios in Tangerang',
    sdrTotalBiz: 'Total Businesses',
    sdrRunningBiz: 'Running Businesses',
    sdrTotalShoot: 'Total Shoot Hours',
    sdrAvgRate: 'Average Rate',

    // Login & Auth
    loginTitle: 'CRM Tangerang Portal',
    loginSubWelcome: 'Sign in to access your operational workspace',
    signupSubWelcome: 'Register for CRM Tangerang Access',
    loginBtn: 'Sign In to Portal',
    signupBtn: 'Create Account',
    noAccountPrompt: 'Don\'t have an account?',
    haveAccountPrompt: 'Already have an account?',
    signUpNow: 'Register Now',
    signInNow: 'Sign In',
    authSuccess: 'Authentication successful',
    authFailed: 'Invalid email or password.'
  }
}

// ─── Status Localization Helper ───────────────────────────────────────────────

export function getStatusLabel(status: Status, lang: Language): string {
  if (lang === 'en') {
    switch (status) {
      case 'Running': return 'Running'
      case 'approved': return 'Approved'
      case 'pending': return 'Pending Approval'
      case 'canceled': return 'Canceled'
      case 'Stopped': return 'Stopped'
      case 'Fraud': return 'Fraud (Duplicate Data)'
      default: return status
    }
  }
  switch (status) {
    case 'Running': return 'Sedang Berjalan'
    case 'approved': return 'Disetujui'
    case 'pending': return 'Menunggu Persetujuan'
    case 'canceled': return 'Dibatalkan'
    case 'Stopped': return 'Dihentikan'
    case 'Fraud': return 'Fraud (Data Duplikat)'
    default: return status
  }
}

// ─── Phone & Duplicate / Fraud Helpers ────────────────────────────────────────

export function normalizePhoneNumber(raw?: string): string {
  if (!raw) return ''
  let cleaned = raw.toString().trim().replace(/[^0-9+]/g, '')
  if (cleaned.startsWith('+62')) {
    cleaned = '62' + cleaned.slice(3).replace(/^0+/, '')
  } else if (cleaned.startsWith('62')) {
    cleaned = '62' + cleaned.slice(2).replace(/^0+/, '')
  } else if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1)
  } else if (cleaned.length > 0) {
    cleaned = '62' + cleaned
  }
  return cleaned.replace(/[^0-9]/g, '')
}

export function formatPhoneDisplay(raw?: string): string {
  if (!raw) return '—'
  const normalized = normalizePhoneNumber(raw)
  if (!normalized) return raw
  const without62 = normalized.startsWith('62') ? normalized.slice(2) : normalized
  return `+62 ${without62}`
}

export function checkDuplicateOwner(
  form: { id?: string; ownerKtp?: string; accountNumber?: string; phone?: string; businessName?: string },
  existingBusinesses: Business[],
  lang: Language = 'id'
): { isDuplicate: boolean; reasons: string[]; matchedBusinesses: Business[] } {
  const cleanNik = (form.ownerKtp || '').trim().replace(/[^0-9]/g, '')
  const cleanAcc = (form.accountNumber || '').trim().replace(/[^0-9]/g, '')
  const cleanPhone = normalizePhoneNumber(form.phone || '')

  const reasons: string[] = []
  const matched: Business[] = []

  for (const b of existingBusinesses) {
    if (form.id && b.id === form.id) continue
    if (form.businessName && b.businessName.trim().toLowerCase() === form.businessName.trim().toLowerCase()) continue

    const bNik = (b.ownerKtp || '').trim().replace(/[^0-9]/g, '')
    const bAcc = (b.accountNumber || '').trim().replace(/[^0-9]/g, '')
    const bPhone = normalizePhoneNumber(b.phone || '')

    let matchedThis = false
    if (cleanNik && cleanNik.length === 16 && bNik === cleanNik) {
      reasons.push(
        lang === 'en'
          ? `Owner NIK (${cleanNik}) already registered under business "${b.businessName}" (SDR: ${b.sdrName})`
          : `NIK KTP Pemilik (${cleanNik}) sudah terdaftar di bisnis "${b.businessName}" (SDR: ${b.sdrName})`
      )
      matchedThis = true
    }
    if (cleanAcc && cleanAcc.length >= 6 && bAcc === cleanAcc) {
      reasons.push(
        lang === 'en'
          ? `Bank Account Number (${cleanAcc}) already registered under business "${b.businessName}" (SDR: ${b.sdrName})`
          : `Nomor Rekening Bank (${cleanAcc}) sudah terdaftar di bisnis "${b.businessName}" (SDR: ${b.sdrName})`
      )
      matchedThis = true
    }
    if (cleanPhone && cleanPhone.length >= 10 && bPhone === cleanPhone) {
      reasons.push(
        lang === 'en'
          ? `Phone Number (+${cleanPhone}) already registered under business "${b.businessName}" (SDR: ${b.sdrName})`
          : `Nomor Telepon (+${cleanPhone}) sudah terdaftar di bisnis "${b.businessName}" (SDR: ${b.sdrName})`
      )
      matchedThis = true
    }

    if (matchedThis && !matched.some(m => m.id === b.id)) {
      matched.push(b)
    }
  }

  return {
    isDuplicate: reasons.length > 0,
    reasons,
    matchedBusinesses: matched,
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────

export type Hardware = 'MC' | 'MONO' | 'EgoExo' | 'MC + MONO'

export const HW_PREFIX: Record<Hardware, string> = {
  MC: 'MSTN',
  MONO: 'IPTN',
  EgoExo: 'EGTN',
  'MC + MONO': 'MCTN',
}

export function normalizeHardware(raw?: string): Hardware {
  if (!raw) return 'MC'
  const clean = raw.trim().toLowerCase().replace(/[\s\-_]/g, '')
  if (clean === 'mc') return 'MC'
  if (clean === 'mono') return 'MONO'
  if (clean === 'egoexo' || clean === 'ego' || clean === 'exo') return 'EgoExo'
  if (clean === 'mc+mono' || clean === 'mc&mono' || clean === 'mcmono') return 'MC + MONO'
  if (raw.includes('MONO') || raw.includes('Mono')) return 'MONO'
  if (raw.includes('Ego')) return 'EgoExo'
  if (raw.includes('MC')) return 'MC'
  return 'MC'
}

export type Role = 'Field Ops' | 'Sales Manager' | 'Coordinator' | 'SDR'

export interface User {
  role: Role
  name: string
  email: string
  avatarUrl?: string
  dedicatedSdrs?: string[]
}

export interface EditRequest {
  requestId: string
  timestamp: string
  requesterName: string
  requesterRole: Role
  businessName: string
  sdrName: string
  status: 'pending' | 'approved' | 'rejected'
  originalData: Partial<Business> | null
  updatedData: Business | null
  reviewerNote?: string
}

export interface RawShootLogItem {
  id: string
  businessName: string
  kitCode: string
  sdrName: string
  date: string
  parsedDate: Date | null
  hours: number
  videos: number
  notes: string
}

export interface ShootKitDetail {
  kitCode: string
  totalHours: number
  totalVideos: number
  targetHours: number
  utilPercent: number
  isMaximal: boolean
  lastDate?: string
  lastParsedDate?: Date | null
  logs: RawShootLogItem[]
}

export interface ShootBusinessGroup {
  businessName: string
  crmSdr: string
  city?: string
  targetHours: number
  crmStatus: Status
  totalHours: number
  totalVideos: number
  kitsCount: number
  kits: ShootKitDetail[]
  lastReportDate?: string
  lastReportParsedDate?: Date | null
  hasRecentReport: boolean
  shootStatus: 'Maksimal' | 'Sedang Berjalan' | 'Stopped'
  utilPercent: number
}

export type Status = 'Running' | 'pending' | 'approved' | 'canceled' | 'Stopped' | 'Fraud'
type BankName = string
type AccountType = 'PERSON' | 'BUSINESS'

const WISE_BANKS = [
  "Allo Bank Indonesia",
  "BANK JATIM UNIT USAHA SYARIAH",
  "BANK PEMBANGUNAN DAERAH JAMBI",
  "BANK PEMBANGUNAN DAERAH JAMBI UUS",
  "Bank Aceh Syariah",
  "Bank Aladin Syariah",
  "Bank Amar Indonesia",
  "Bank ANZ Indonesia",
  "Bank Artha Graha Internasional",
  "Bank BTPN",
  "Bank BTPN Syariah",
  "Bank BUKOPIN",
  "Bank BUKOPIN Syariah",
  "Bank BCA Syariah",
  "Bank Bengkulu",
  "Bank BJB",
  "Bank BJB Syariah",
  "Bank BNP Paribas Indonesia",
  "Bank BPD Bali",
  "Bank BPD DIY",
  "Bank BPD DIY Syariah",
  "Bank BRK Syariah",
  "Bank BSG",
  "Bank Bumi Arta",
  "Bank Capital Indonesia",
  "Bank Central Asia (BCA)",
  "Bank CIMB Niaga",
  "Bank CIMB Niaga Syariah",
  "Bank CTBC Indonesia",
  "Bank Danamon",
  "Bank Danamon Syariah",
  "Bank DBS Indonesia",
  "Bank Digital BCA (Blu)",
  "Bank DKI",
  "Bank DKI Syariah",
  "Bank Ganesha",
  "Bank Hana",
  "Bank Harda Internasional (Allo Bank)",
  "Bank HSBC Indonesia",
  "Bank IBK Indonesia",
  "Bank ICBC Indonesia",
  "Bank Ina Perdana",
  "Bank Index Selindo",
  "Bank Jago",
  "Bank Jago Syariah",
  "Bank Jasa Jakarta",
  "Bank Jateng",
  "Bank Jateng Syariah",
  "Bank Jatim",
  "Bank JTrust Indonesia",
  "Bank Kalbar",
  "Bank Kalbar Syariah",
  "Bank Kalsel",
  "Bank Kalsel Syariah",
  "Bank Kalteng",
  "Bank Kaltimtara",
  "Bank Kaltimtara Syariah",
  "Bank KB Bukopin",
  "Bank Lampung",
  "Bank Maluku Malut",
  "Bank Mandiri",
  "Bank Mandiri Taspen",
  "Bank Maspion Indonesia",
  "Bank Mayapada Internasional",
  "Bank Maybank Indonesia",
  "Bank Maybank Syariah Indonesia",
  "Bank Mega",
  "Bank Mega Syariah",
  "Bank Mestika Dharma",
  "Bank Mizuho Indonesia",
  "Bank MNC Internasional",
  "Bank Muamalat Indonesia",
  "Bank Multiarta Sentosa",
  "Bank Nagari",
  "Bank Nagari Syariah",
  "Bank Nationalnobu",
  "Bank Neocommerce (BNC)",
  "Bank NTB Syariah",
  "Bank NTT",
  "Bank OCBC NISP",
  "Bank OCBC NISP Syariah",
  "Bank Of China (Hong Kong) Limited",
  "Bank Of India Indonesia",
  "Bank Papua",
  "Bank Permata",
  "Bank Permata Syariah",
  "Bank QNB Indonesia",
  "Bank Raya Indonesia",
  "Bank Resona Perdania",
  "Bank Riau Kepri Syariah",
  "Bank Sahabat Sampoerna",
  "Bank SBI Indonesia",
  "Bank Seabank Indonesia",
  "Bank Shinhan Indonesia",
  "Bank Sinarmas",
  "Bank Sinarmas Syariah",
  "Bank Sulselbar",
  "Bank Sulselbar Syariah",
  "Bank Sulteng",
  "Bank Sultra",
  "Bank Sumsel Babel",
  "Bank Sumsel Babel Syariah",
  "Bank Sumut",
  "Bank Sumut Syariah",
  "Bank Syariah Indonesia (BSI)",
  "Bank Tabungan Negara (BTN)",
  "Bank Tabungan Negara Syariah",
  "Bank UOB Indonesia",
  "Bank Victoria Internasional",
  "Bank Victoria Syariah",
  "Bank Woori Saudara Indonesia 1906",
  "BCA Bank Central Asia",
  "BPD Kalsel Syariah",
  "BRI Bank Rakyat Indonesia",
  "Citibank N.A.",
  "DBS Bank Indonesia",
  "Deutsche Bank AG",
  "JPMorgan Chase Bank, N.A.",
  "MUFG Bank, Ltd.",
  "PT BANK BPD DIY",
  "PT BANK IBK INDONESIA TBK",
  "PT BANK KB BUKOPIN TBK",
  "PT Bank KEB Hana Indonesia",
  "PT BANK MANDIRI (PERSERO) TBK",
  "PT BANK NATIONALNOBU TBK",
  "PT BANK OKE INDONESIA TBK",
  "PT BANK SEABANK INDONESIA",
  "PT BANK SHINHAN INDONESIA",
  "PT BANK WOORI SAUDARA INDONESIA 1906 TBK",
  "PT BPD SULAWESI TENGAH",
  "PT SUPER BANK INDONESIA",
  "Standard Chartered Bank",
  "Superbank"
]

export interface Business {
  id: string
  businessName: string
  sdrName: string
  submissionDate: string
  hours: number
  hardware: Hardware
  quantity: number
  rate: number
  accountHolderName: string
  bankName: BankName
  accountNumber: string
  accountType: AccountType
  city: string
  fullAddress: string
  postalCode: string
  phone: string
  email: string
  ownerKtp: string
  proposalLink: string
  mouLink: string
  agreementLink: string
  status: Status
  ktpPhotoUrl?: string
  hasPendingEdit?: boolean
  
  // Dynamic fields computed from Shoot Report
  shootHours?: number
  shootVideos?: number
  shootKitCodes?: string[]
  shootLastDate?: string
  shootIsMaximal?: boolean
  shootUtilPercent?: number
  shootStatus?: 'Maksimal' | 'Sedang Berjalan' | 'Stopped'
}

type Page = 'dashboard' | 'businesses' | 'sdr' | 'shoot-report' | 'approvals' | 'team'

const SDR_LIST = ['Aldy', 'Ariel', 'Billy', 'Hendra', 'Irwan', 'Markus', 'Riki', 'Reksa', 'Reksi', 'Sefti', 'Wahyu']

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function canEditBusiness(user: User, business: Business): boolean {
  if (user.role === 'Sales Manager' || user.role === 'Coordinator') return true
  if (user.role === 'SDR') {
    const sdrName = (business.sdrName || '').trim().toLowerCase()
    const userName = (user.name || '').trim().toLowerCase()
    const userEmail = (user.email || '').trim().toLowerCase()
    return sdrName === userName || sdrName === userEmail
  }
  if (user.role === 'Field Ops') {
    if (user.dedicatedSdrs && Array.isArray(user.dedicatedSdrs) && user.dedicatedSdrs.length > 0) {
      const sdrName = (business.sdrName || '').trim().toLowerCase()
      return user.dedicatedSdrs.some(s => s.trim().toLowerCase() === sdrName)
    }
    return false
  }
  return false
}

export function canViewBusiness(user?: User | null, business?: { sdrName?: string }): boolean {
  if (!user || !business) return true
  if (user.role === 'Sales Manager' || user.role === 'Coordinator') return true
  if (user.role === 'SDR') {
    const sdrName = (business.sdrName || '').trim().toLowerCase()
    const userName = (user.name || '').trim().toLowerCase()
    const userEmail = (user.email || '').trim().toLowerCase()
    return sdrName === userName || sdrName === userEmail
  }
  if (user.role === 'Field Ops') {
    if (user.dedicatedSdrs && Array.isArray(user.dedicatedSdrs) && user.dedicatedSdrs.length > 0) {
      const sdrName = (business.sdrName || '').trim().toLowerCase()
      return user.dedicatedSdrs.some(s => s.trim().toLowerCase() === sdrName)
    }
    return true
  }
  return true
}

export function isMulticamAutoStopped(b: { hardware?: string; shootLastDate?: string; submissionDate?: string }): boolean {
  const isMc = b.hardware === 'MC' || b.hardware === 'MC + MONO' || (b.hardware && b.hardware.includes('MC'))
  if (!isMc) return false

  const now = new Date()
  const reportDate = parseAnyDate(b.shootLastDate)
  if (reportDate) {
    const diffMs = now.getTime() - reportDate.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    return diffDays >= 3
  }

  const subDate = parseAnyDate(b.submissionDate)
  if (subDate) {
    const diffMs = now.getTime() - subDate.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    return diffDays >= 3
  }

  return false
}

export function getDirectImageUrl(url?: string): string {
  if (!url) return ''
  if (url.startsWith('data:') || url.startsWith('blob:')) return url
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/)
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`
  }
  return url
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const formatNumber = (n: number) =>
  new Intl.NumberFormat('id-ID').format(n)

const STATUS_COLORS: Record<Status, string> = {
  Running: 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold',
  approved: 'bg-blue-50 text-blue-800 border border-blue-300 font-semibold',
  pending: 'bg-amber-50 text-amber-800 border border-amber-300 font-semibold',
  canceled: 'bg-rose-50 text-rose-800 border border-rose-300 font-semibold',
  Stopped: 'bg-slate-100 text-slate-700 border border-slate-300 font-semibold',
  Fraud: 'bg-rose-100 text-rose-800 border border-rose-400 font-bold',
}

const HARDWARE_COLORS: Record<Hardware, string> = {
  MC: '#4f46e5',         // Indigo
  MONO: '#059669',       // Emerald
  EgoExo: '#d97706',     // Amber
  'MC + MONO': '#0284c7', // Sky Blue
}

const BLANK_FORM: Omit<Business, 'id'> = {
  businessName: '', sdrName: SDR_LIST[0], submissionDate: '', hours: 0,
  hardware: 'MC', quantity: 1, rate: 0, accountHolderName: '', bankName: WISE_BANKS[0],
  accountNumber: '', accountType: 'PERSON', city: '', fullAddress: '',
  postalCode: '', phone: '', email: '', ownerKtp: '', proposalLink: '',
  mouLink: '', agreementLink: '', status: 'Running', ktpPhotoUrl: '',
}

// ─── User Avatar Component ───────────────────────────────────────────────────

function UserAvatar({
  user,
  url,
  name,
  size = 'md',
  className = '',
  showRoleBadge = false,
}: {
  user?: User | null
  url?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  showRoleBadge?: boolean
}) {
  const [hasError, setHasError] = useState(false)
  const effectiveUrl = url || user?.avatarUrl
  const effectiveName = name || user?.name || 'User'
  const directUrl = useMemo(() => getDirectImageUrl(effectiveUrl), [effectiveUrl])

  useEffect(() => {
    setHasError(false)
  }, [directUrl])

  const sizeClasses = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
    '2xl': 'w-24 h-24 text-3xl',
  }

  const roleBadgeColors: Record<Role, string> = {
    'Sales Manager': 'bg-purple-500',
    Coordinator: 'bg-indigo-500',
    'Field Ops': 'bg-emerald-500',
    SDR: 'bg-blue-500',
  }

  return (
    <div className="relative inline-block shrink-0">
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-slate-800 text-white font-bold flex items-center justify-center border-2 border-slate-700 shadow-sm ${className}`}>
        {directUrl && !hasError ? (
          <img
            src={directUrl}
            alt={effectiveName}
            className="w-full h-full object-cover"
            onError={() => setHasError(true)}
          />
        ) : (
          <span>{effectiveName.charAt(0).toUpperCase()}</span>
        )}
      </div>
    </div>
  )
}

function LanguageToggle({ lang, onChangeLang }: { lang: Language; onChangeLang: (l: Language) => void }) {
  return (
    <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
      <button
        onClick={() => onChangeLang('id')}
        className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
          lang === 'id' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
        }`}
        title="Bahasa Indonesia"
      >
        ID
      </button>
      <button
        onClick={() => onChangeLang('en')}
        className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
          lang === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
        }`}
        title="English"
      >
        EN
      </button>
    </div>
  )
}

function NavItem({
  icon,
  label,
  active,
  onClick,
  badge
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
  badge?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        active
          ? 'bg-slate-800 text-white font-semibold border border-slate-700'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={active ? 'text-indigo-400' : 'text-slate-400'}>{icon}</span>
        <span>{label}</span>
      </div>
      {typeof badge === 'number' && badge > 0 && (
        <span className="px-2 py-0.5 text-xs font-bold bg-indigo-600 text-white rounded-full">
          {badge}
        </span>
      )}
    </button>
  )
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  variant = 'indigo'
}: {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  variant?: 'indigo' | 'emerald' | 'purple' | 'amber'
}) {
  const borderColors = {
    indigo: 'border-indigo-200 bg-white hover:border-indigo-300',
    emerald: 'border-emerald-200 bg-white hover:border-emerald-300',
    purple: 'border-purple-200 bg-white hover:border-purple-300',
    amber: 'border-amber-200 bg-white hover:border-amber-300',
  }
  const iconColors = {
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
  }

  return (
    <div className={`p-5 rounded-2xl border ${borderColors[variant]} shadow-xs transition-all`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500 font-sans uppercase tracking-wider">{label}</p>
        <div className={`p-2 rounded-xl border ${iconColors[variant]}`}>{icon}</div>
      </div>
      <p className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1 font-mono">{sub}</p>}
    </div>
  )
}

function Field({
  label,
  children,
  required = false
}: {
  label: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1 font-sans">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  )
}

// ─── Business Form Modal ──────────────────────────────────────────────────────

function BusinessModal({
  initial,
  existingBusinesses = [],
  user,
  lang,
  onSave,
  onClose,
}: {
  initial: Omit<Business, 'id'> & { id?: string }
  existingBusinesses?: Business[]
  user: User
  lang: Language
  onSave: (b: Omit<Business, 'id'> & { id?: string, originalBusinessName?: string, originalSdrName?: string }) => void
  onClose: () => void
}) {
  const t = TRANSLATIONS[lang]
  const [form, setForm] = useState(() => ({
    ...initial,
    phone: normalizePhoneNumber(initial.phone)
  }))

  // KTP Upload State
  const [ktpUploadBase64, setKtpUploadBase64] = useState<string | null>(null)
  const [ktpUploadMime, setKtpUploadMime] = useState<string | null>(null)
  const [isUploadingKtp, setIsUploadingKtp] = useState(false)
  const ktpFileInputRef = useRef<HTMLInputElement>(null)

  const originalBusinessName = useRef(initial.businessName).current
  const originalSdrName = useRef(initial.sdrName).current

  const set = (key: keyof typeof form, val: any) => setForm(f => ({ ...f, [key]: val }))

  // Phone helpers (+62 format)
  const getNationalPhone = (p?: string) => {
    if (!p) return ''
    const clean = p.replace(/[^0-9]/g, '')
    if (clean.startsWith('62')) return clean.slice(2)
    if (clean.startsWith('0')) return clean.slice(1)
    return clean
  }

  const handlePhoneInput = (val: string) => {
    let clean = val.replace(/[^0-9]/g, '')
    if (clean.startsWith('62')) {
      clean = clean.slice(2)
    }
    if (clean.startsWith('0')) {
      clean = clean.slice(1)
    }
    set('phone', clean ? `62${clean}` : '')
  }

  // Duplicate / Fraud Real-time Check
  const duplicateOwner = useMemo(() => {
    return checkDuplicateOwner(form, existingBusinesses, lang)
  }, [form.ownerKtp, form.accountNumber, form.phone, form.id, form.businessName, existingBusinesses, lang])

  const handleKtpFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 8 * 1024 * 1024) {
      alert(lang === 'id' ? "Ukuran file KTP maksimal 8MB" : "KTP file size cannot exceed 8MB")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setKtpUploadBase64(result.split(',')[1])
      setKtpUploadMime(file.type)
      set('ktpPhotoUrl', result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.businessName.trim()) {
      alert(lang === 'id' ? 'Nama bisnis wajib diisi.' : 'Business name is required.')
      return
    }

    const normalizedNewName = form.businessName.trim().toLowerCase()
    const duplicate = existingBusinesses.find(b =>
      b.id !== form.id &&
      b.businessName.trim().toLowerCase() === normalizedNewName
    )
    if (duplicate) {
      alert(lang === 'id'
        ? `Bisnis "${form.businessName}" sudah terdaftar (oleh SDR: ${duplicate.sdrName}). Mohon gunakan nama bisnis yang unik.`
        : `Business "${form.businessName}" already exists (registered by SDR: ${duplicate.sdrName}). Please use a unique name.`
      )
      return
    }

    if (!form.submissionDate || !form.hours || !form.hardware || !form.quantity || !form.rate) {
      alert(lang === 'id' ? 'Tanggal Pengajuan, Target Jam, Tipe Hardware, Jumlah, dan Rate wajib diisi.' : 'Submission Date, Target Hours, Hardware Type, Quantity, and Rate are required.')
      return
    }

    if (!form.city.trim() || !form.fullAddress.trim() || !form.phone.trim() || !form.email.trim()) {
      alert(lang === 'id' ? 'Kota, Alamat Lengkap, Nomor Telepon, dan Email wajib diisi.' : 'City, Full Address, Phone, and Email are required.')
      return
    }

    const cleanPhone = normalizePhoneNumber(form.phone)
    if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 16) {
      alert(lang === 'id' ? 'Nomor Telepon tidak valid. Minimal 10 digit (contoh: 628123456789).' : 'Phone number is invalid. Minimum 10 digits.')
      return
    }

    const cleanPostal = (form.postalCode || '').trim()
    if (!/^\d{5}$/.test(cleanPostal)) {
      alert(lang === 'id' ? 'Kode Pos wajib diisi tepat 5 angka.' : 'Postal Code must be exactly 5 digits.')
      return
    }

    if (!form.accountHolderName.trim() || !form.accountNumber.trim() || !form.bankName) {
      alert(lang === 'id' ? 'Nama Pemilik Rekening, Bank, dan Nomor Rekening wajib diisi.' : 'Account Holder Name, Bank Name, and Account Number are required.')
      return
    }

    const cleanNik = (form.ownerKtp || '').trim()
    if (!/^\d{16}$/.test(cleanNik)) {
      alert(lang === 'id' ? 'NIK wajib diisi tepat 16 digit angka.' : 'NIK / ID Card Number must be exactly 16 digits.')
      return
    }

    let finalKtpUrl = form.ktpPhotoUrl || ''

    if (ktpUploadBase64 && ktpUploadMime) {
      setIsUploadingKtp(true)
      const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL
      if (scriptUrl) {
        try {
          const cleanBiz = form.businessName.replace(/[^a-zA-Z0-9]/g, '_')
          const uploadRes = await fetch(scriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              action: 'upload_file',
              folderType: 'ktp',
              fileName: `KTP_${cleanBiz}_${cleanNik}_${Date.now()}`,
              mimeType: ktpUploadMime,
              fileData: ktpUploadBase64
            })
          })
          const uploadData = await uploadRes.json()
          if (uploadData && (uploadData.directUrl || uploadData.url)) {
            finalKtpUrl = uploadData.directUrl || uploadData.url
          }
        } catch (uErr) {
          console.error("KTP upload error:", uErr)
        }
      }
      setIsUploadingKtp(false)
    }

    // Mandatory KTP photo check
    if (!finalKtpUrl && !ktpUploadBase64) {
      alert(lang === 'id' ? 'Foto KTP Pemilik Bisnis wajib diunggah.' : 'Business Owner KTP Photo is required.')
      return
    }

    // Auto-Fraud Assignment on duplicate owner
    let finalStatus: Status = form.status
    if (duplicateOwner.isDuplicate) {
      finalStatus = 'Fraud'
      alert(lang === 'id'
        ? `⚠️ PERINGATAN FRAUD:\nData pemilik terdeteksi sama dengan bisnis lain:\n- ${duplicateOwner.reasons.join('\n- ')}\n\nStatus bisnis otomatis diset menjadi "Fraud" di CRM dan Spreadsheet.`
        : `⚠️ FRAUD ALERT:\nDuplicate owner data detected:\n- ${duplicateOwner.reasons.join('\n- ')}\n\nBusiness status has been automatically set to "Fraud".`
      )
    }

    onSave({
      ...form,
      phone: cleanPhone,
      status: finalStatus,
      ownerKtp: cleanNik,
      postalCode: cleanPostal,
      ktpPhotoUrl: finalKtpUrl,
      originalBusinessName,
      originalSdrName,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-sans">
              {initial.id ? t.modalEditTitle : t.modalAddTitle}
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {form.businessName || (lang === 'id' ? 'Entri Bisnis Baru' : 'New Business Entry')}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 text-sm transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {initial.id && user.role === 'SDR' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-mono">
              ⚠️ {t.sdrApprovalWarning}
            </div>
          )}

          {/* Real-time Fraud Banner */}
          {duplicateOwner.isDuplicate && (
            <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-900 shadow-xs">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🚨</span>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 font-mono">
                    {lang === 'id' ? 'Terdeteksi Data Owner Duplikat (Potensi Fraud)' : 'Duplicate Owner Data Detected (Potential Fraud)'}
                  </h4>
                  <ul className="text-xs text-rose-800 list-disc list-inside space-y-0.5 font-medium">
                    {duplicateOwner.reasons.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-rose-700 font-semibold mt-1">
                    {lang === 'id'
                      ? 'Status bisnis ini akan otomatis ditandai sebagai "Fraud" saat disimpan.'
                      : 'This business status will be automatically marked as "Fraud" upon saving.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Business Info */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 font-mono border-b pb-1 border-slate-100">{t.secBizInfo}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={t.thBizName} required>
                <input className="form-input" placeholder={lang === 'id' ? 'Nama bisnis lengkap' : 'Full business name'} value={form.businessName} onChange={e => set('businessName', e.target.value)} required />
              </Field>
              <Field label={t.thSdr} required>
                <select
                  className="form-input font-medium"
                  value={form.sdrName}
                  onChange={e => set('sdrName', e.target.value)}
                  disabled={Boolean(initial.id) && user.role === 'SDR'}
                  required
                >
                  {!initial.id ? (
                    SDR_LIST.map(s => <option key={s} value={s}>{s}</option>)
                  ) : (
                    user.role === 'SDR' ? (
                      <option value={form.sdrName || user.name}>{form.sdrName || user.name}</option>
                    ) : (user.role === 'Field Ops' || user.role === 'Coordinator') && user.dedicatedSdrs && user.dedicatedSdrs.length > 0 ? (
                      Array.from(new Set([...user.dedicatedSdrs, form.sdrName].filter(Boolean))).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))
                    ) : (
                      SDR_LIST.map(s => <option key={s} value={s}>{s}</option>)
                    )
                  )}
                </select>
              </Field>
              <Field label={t.thDate} required>
                <input type="date" className="form-input font-mono" value={form.submissionDate} onChange={e => set('submissionDate', e.target.value)} required />
              </Field>
              <Field label={t.thHardware} required>
                <select className="form-input font-medium" value={form.hardware} onChange={e => set('hardware', e.target.value as Hardware)} required>
                  {(['MC', 'MONO', 'EgoExo', 'MC + MONO'] as Hardware[]).map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </Field>
              <Field label={t.thHours} required>
                <input type="number" min="1" className="form-input font-mono" placeholder={lang === 'id' ? 'Target jam shoot' : 'Target shooting hours'} value={form.hours || ''} onChange={e => set('hours', parseInt(e.target.value) || 0)} required />
              </Field>
              <Field label={lang === 'id' ? 'Jumlah Unit Kit' : 'Kit Quantity'} required>
                <input type="number" min="1" className="form-input font-mono" placeholder={lang === 'id' ? 'Jumlah unit kit' : 'Kit quantity'} value={form.quantity || ''} onChange={e => set('quantity', parseInt(e.target.value) || 0)} required />
              </Field>
              <Field label={t.thRate} required>
                <input type="number" min="0" step="any" className="form-input font-mono" placeholder={lang === 'id' ? 'Rate $/jam (contoh: 5 atau 6)' : 'Rate $/hour (e.g. 5 or 6)'} value={form.rate || ''} onChange={e => set('rate', parseFloat(e.target.value) || 0)} required />
              </Field>
              <Field label={t.detailStatus || 'Status Bisnis'}>
                <select
                  className={`form-input font-bold font-mono ${STATUS_COLORS[form.status] || STATUS_COLORS.Running}`}
                  value={form.status}
                  onChange={e => set('status', e.target.value as Status)}
                >
                  <option value="Running">{getStatusLabel('Running', lang)}</option>
                  <option value="approved">{getStatusLabel('approved', lang)}</option>
                  <option value="pending">{getStatusLabel('pending', lang)}</option>
                  <option value="canceled">{getStatusLabel('canceled', lang)}</option>
                  <option value="Stopped">{getStatusLabel('Stopped', lang)}</option>
                  <option value="Fraud">{getStatusLabel('Fraud', lang)}</option>
                </select>
              </Field>
            </div>
          </div>

          {/* Section 2: Contact & Location */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 font-mono border-b pb-1 border-slate-100">{t.secContact}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={t.thCity} required>
                <input className="form-input" placeholder={lang === 'id' ? 'Kota / Wilayah' : 'City / Region'} value={form.city} onChange={e => set('city', e.target.value)} required />
              </Field>
              <Field label={lang === 'id' ? 'Kode Pos (5 Digit)' : 'Postal Code (5 Digits)'} required>
                <input
                  className="form-input font-mono"
                  placeholder={lang === 'id' ? 'Contoh: 15151' : 'Example: 15151'}
                  maxLength={5}
                  minLength={5}
                  pattern="[0-9]{5}"
                  value={form.postalCode}
                  onChange={e => set('postalCode', e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
                  required
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label={lang === 'id' ? 'Alamat Lengkap' : 'Full Address'} required>
                  <input className="form-input" placeholder={lang === 'id' ? 'Jalan, RT/RW, Kelurahan, Kecamatan' : 'Street, District, City'} value={form.fullAddress} onChange={e => set('fullAddress', e.target.value)} required />
                </Field>
              </div>
              <Field label={t.thPhone} required>
                <div>
                  <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-slate-900/20 focus-within:border-slate-800 transition-all bg-white">
                    <span className="inline-flex items-center px-3.5 bg-slate-100 text-slate-700 font-mono font-bold text-xs border-r border-slate-200 select-none">
                      +62
                    </span>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 text-sm font-mono focus:outline-none bg-white text-slate-900 placeholder:text-slate-400"
                      placeholder="81234567890"
                      value={getNationalPhone(form.phone)}
                      onChange={e => handlePhoneInput(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    {form.phone ? (lang === 'id' ? `Format tersimpan di Spreadsheet: ${form.phone}` : `Spreadsheet format: ${form.phone}`) : (lang === 'id' ? 'Masukkan nomor telepon (contoh: 8123456789)' : 'Enter phone number (e.g. 8123456789)')}
                  </p>
                </div>
              </Field>
              <Field label="Email" required>
                <input type="email" className="form-input font-mono" placeholder="email@domain.com" value={form.email} onChange={e => set('email', e.target.value)} required />
              </Field>
            </div>
          </div>

          {/* Section 3: Bank Details */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 font-mono border-b pb-1 border-slate-100">{t.secBank}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={t.detailAccHolder} required>
                <input className="form-input" placeholder={lang === 'id' ? 'Nama sesuai rekening bank' : 'Name as registered on bank account'} value={form.accountHolderName} onChange={e => set('accountHolderName', e.target.value)} required />
              </Field>
              <Field label={t.detailBankName} required>
                <select className="form-input font-medium" value={form.bankName} onChange={e => set('bankName', e.target.value)} required>
                  {WISE_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>
              <Field label={t.detailAccNumber} required>
                <input className="form-input font-mono" placeholder={lang === 'id' ? 'Nomor rekening bank' : 'Bank account number'} value={form.accountNumber} onChange={e => set('accountNumber', e.target.value.replace(/[^0-9]/g, ''))} required />
              </Field>
              <Field label={t.detailAccType} required>
                <select className="form-input font-medium" value={form.accountType} onChange={e => set('accountType', e.target.value as AccountType)} required>
                  <option value="PERSON">{lang === 'id' ? 'Pribadi (PERSON)' : 'Personal (PERSON)'}</option>
                  <option value="BUSINESS">{lang === 'id' ? 'Perusahaan (BUSINESS)' : 'Business (BUSINESS)'}</option>
                </select>
              </Field>
            </div>
          </div>

          {/* Section 4: NIK & KTP Identity */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 font-mono border-b pb-1 border-slate-100">
              {lang === 'id' ? 'Identitas Pemilik Bisnis (NIK & KTP)' : 'Business Owner Identity (NIK & ID Card)'}
            </h3>
            <div className="space-y-4">
              <Field label={lang === 'id' ? 'NIK Pemilik Bisnis (16 Digit Angka)' : 'Owner NIK (16 Digits Number)'} required>
                <input
                  className="form-input font-mono tracking-wider"
                  placeholder={lang === 'id' ? 'Contoh: 3671120910910005' : 'Example: 3671120910910005'}
                  maxLength={16}
                  minLength={16}
                  pattern="[0-9]{16}"
                  value={form.ownerKtp}
                  onChange={e => set('ownerKtp', e.target.value.replace(/[^0-9]/g, '').slice(0, 16))}
                  required
                />
              </Field>

              <Field label={lang === 'id' ? 'Foto KTP Pemilik Bisnis (Wajib)' : 'Owner KTP Photo (Required)'} required>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={ktpFileInputRef}
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleKtpFileSelect}
                    />
                    <button
                      type="button"
                      onClick={() => ktpFileInputRef.current?.click()}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300 rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      {ktpUploadBase64 ? (lang === 'id' ? 'Ganti Foto KTP' : 'Change KTP Photo') : (lang === 'id' ? 'Pilih Foto KTP' : 'Choose KTP Photo')}
                    </button>
                    <span className="text-xs text-slate-500 font-mono truncate">
                      {ktpUploadBase64 ? (lang === 'id' ? '✓ File KTP siap diunggah' : '✓ KTP file ready to upload') : (form.ktpPhotoUrl ? (lang === 'id' ? '✓ Foto KTP tersimpan' : '✓ KTP photo saved') : (lang === 'id' ? 'Belum ada file dipilih' : 'No file chosen'))}
                    </span>
                  </div>
                  {form.ktpPhotoUrl && (
                    <div className="relative w-44 h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-2xs">
                      <img
                        src={getDirectImageUrl(form.ktpPhotoUrl)}
                        alt="Preview KTP"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none' }}
                      />
                    </div>
                  )}
                </div>
              </Field>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">{t.cancel}</button>
            <button
              type="submit"
              disabled={isUploadingKtp}
              className="px-5 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-xs"
            >
              {isUploadingKtp ? t.uploadingKtp : (initial.id ? (user.role === 'SDR' ? t.submitApproval : t.saveChanges) : t.addBusiness)}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Detail View Modal ────────────────────────────────────────────────────────

function DetailModal({ b, lang, onClose }: { b: Business; lang: Language; onClose: () => void }) {
  const t = TRANSLATIONS[lang]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-sans">{b.businessName}</h2>
            <p className="text-xs text-slate-500 font-mono">{b.city || t.detailNoCity}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 text-sm">✕</button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono">
            <div>
              <p className="text-slate-400">{t.detailSdrInCharge}</p>
              <p className="font-semibold text-slate-900">{b.sdrName}</p>
            </div>
            <div>
              <p className="text-slate-400">{t.detailStatus}</p>
              <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${STATUS_COLORS[b.status] || STATUS_COLORS.Running}`}>
                {getStatusLabel(b.status, lang)}
              </span>
            </div>
            <div>
              <p className="text-slate-400">{t.detailHardware}</p>
              <p className="font-semibold text-slate-900">{b.hardware} ({b.quantity} unit)</p>
            </div>
            <div>
              <p className="text-slate-400">{t.detailTargetRate}</p>
              <p className="font-semibold text-slate-900">{b.hours} hrs · ${b.rate}/hr</p>
            </div>
          </div>

          {/* Shoot Report Activity Highlight */}
          <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950 uppercase tracking-wider text-[11px]">{t.detailShootSection}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                (b.shootHours || 0) > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {(b.shootHours || 0) > 0 ? t.statusBerjalan : t.statusStopped}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <p className="text-slate-500">{t.detailShootHours}:</p>
                <p className="font-bold text-slate-900 text-sm">{b.shootHours || 0} / {b.hours} hrs</p>
              </div>
              <div>
                <p className="text-slate-500">{t.detailShootVideos}:</p>
                <p className="font-bold text-slate-900 text-sm">{b.shootVideos || 0} Video</p>
              </div>
            </div>
            {b.shootLastDate && (
              <p className="text-[11px] text-slate-600">
                <strong>{t.bizLastReport}:</strong> {b.shootLastDate}
              </p>
            )}
            {b.shootKitCodes && b.shootKitCodes.length > 0 && (
              <p className="text-[11px] text-indigo-800">
                <strong>{t.detailShootKits}:</strong> {b.shootKitCodes.join(', ')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="font-bold text-slate-800 uppercase font-mono tracking-wider">{t.detailContactAddress}</p>
            <p className="text-slate-600"><strong>{t.detailAddress}:</strong> {b.fullAddress || '—'} {b.postalCode ? `(${b.postalCode})` : ''}</p>
            <p className="text-slate-600">
              <strong>{t.detailPhone}:</strong>{' '}
              {b.phone ? (
                <a
                  href={`https://wa.me/${normalizePhoneNumber(b.phone)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1 font-semibold"
                  title="WhatsApp"
                >
                  {formatPhoneDisplay(b.phone)}
                  <span className="text-xs">↗</span>
                </a>
              ) : (
                '—'
              )}
            </p>
            <p className="text-slate-600"><strong>{t.detailEmail}:</strong> {b.email || '—'}</p>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-slate-800 uppercase font-mono tracking-wider">{t.detailBankInfo}</p>
            <p className="text-slate-600"><strong>{t.detailBankName}:</strong> {b.bankName}</p>
            <p className="text-slate-600"><strong>{t.detailAccNumber}:</strong> {b.accountNumber || '—'}</p>
            <p className="text-slate-600"><strong>{t.detailAccHolder}:</strong> {b.accountHolderName || '—'}</p>
          </div>

          {b.ktpPhotoUrl && (
            <div className="space-y-2">
              <p className="font-bold text-slate-800 uppercase font-mono tracking-wider">{t.detailOwnerKtp}</p>
              <a href={b.ktpPhotoUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-mono inline-block">
                {t.detailViewKtp}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Team & User Role Management Modal (Sales Manager Only) ───────────────────

// ─── Team Management View ───────────────────────────────────────────────────

function TeamManagementView({
  currentUser,
  users,
  lang,
  onUpdateUserRole,
  onUpdateDedicatedSdrs,
}: {
  currentUser: User
  users: User[]
  lang: Language
  onUpdateUserRole: (email: string, newRole: Role) => void
  onUpdateDedicatedSdrs: (email: string, dedicated: string[]) => void
}) {
  const t = TRANSLATIONS[lang]
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('All')
  const [editingDedicatedEmail, setEditingDedicatedEmail] = useState<string | null>(null)
  const [selectedSdrs, setSelectedSdrs] = useState<string[]>([])
  const [savingEmail, setSavingEmail] = useState<string | null>(null)

  const canChangeRoles = currentUser.role === 'Sales Manager'

  const effectiveUsers = useMemo(() => {
    const list = users.length > 0 ? users : [currentUser]
    return list.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      const matchRole = roleFilter === 'All' || u.role === roleFilter
      return matchSearch && matchRole
    })
  }, [users, currentUser, search, roleFilter])

  const handleOpenDedicated = (u: User) => {
    setEditingDedicatedEmail(u.email)
    setSelectedSdrs(u.dedicatedSdrs || [])
  }

  const handleToggleSdr = (sdr: string) => {
    setSelectedSdrs(prev =>
      prev.includes(sdr) ? prev.filter(s => s !== sdr) : [...prev, sdr]
    )
  }

  const handleSaveDedicated = async () => {
    if (!editingDedicatedEmail) return
    setSavingEmail(editingDedicatedEmail)
    await onUpdateDedicatedSdrs(editingDedicatedEmail, selectedSdrs)
    setSavingEmail(null)
    setEditingDedicatedEmail(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans">{t.manageTeamTitle}</h1>
          <p className="text-sm text-slate-500 mt-1 font-mono">{t.manageTeamSub}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-sans">{lang === 'id' ? 'Total Anggota Tim' : 'Total Team Members'}</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{users.length > 0 ? users.length : 1} {lang === 'id' ? 'Pengguna' : 'Users'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            👥
          </div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-sans">{lang === 'id' ? 'SDR Terdaftar' : 'Registered SDRs'}</p>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">
              {(users.length > 0 ? users : [currentUser]).filter(u => u.role === 'SDR').length} SDR
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            🎯
          </div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-sans">{lang === 'id' ? 'Koordinator & Field Ops' : 'Coordinators & Ops'}</p>
            <p className="text-xl font-bold text-purple-600 mt-0.5">
              {(users.length > 0 ? users : [currentUser]).filter(u => u.role === 'Coordinator' || u.role === 'Field Ops').length} User
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            ⚡
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
          <input
            className="form-input text-xs flex-1 min-w-[180px]"
            placeholder={lang === 'id' ? 'Cari nama atau email anggota tim...' : 'Search by member name or email...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="form-input text-xs w-44 font-mono"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="All">{lang === 'id' ? 'Semua Role' : 'All Roles'}</option>
            <option value="Sales Manager">Sales Manager</option>
            <option value="Coordinator">Coordinator</option>
            <option value="Field Ops">Field Ops</option>
            <option value="SDR">SDR</option>
          </select>
        </div>

        {(search || roleFilter !== 'All') && (
          <button
            onClick={() => { setSearch(''); setRoleFilter('All') }}
            className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
          >
            {t.clearFilters}
          </button>
        )}
      </div>

      {/* Team Roster List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-700 font-mono uppercase tracking-wider">
            {lang === 'id' ? `Daftar Anggota Tim (${effectiveUsers.length} Pengguna)` : `Team Roster (${effectiveUsers.length} Members)`}
          </p>
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            {lang === 'id' ? 'Perubahan role & SDR otomatis tersinkron ke Spreadsheet' : 'Role & SDR changes automatically sync to Spreadsheet'}
          </span>
        </div>

        {effectiveUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs font-mono">
            {lang === 'id' ? 'Tidak ada anggota tim yang cocok dengan filter.' : 'No team members match this filter.'}
          </div>
        ) : (
          effectiveUsers.map(u => {
            const hasDedicated = u.dedicatedSdrs && u.dedicatedSdrs.length > 0

            return (
              <div key={u.email} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-center gap-3.5 min-w-0">
                  <UserAvatar user={u} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 truncate">{u.name}</p>
                      {u.email === currentUser.email && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {lang === 'id' ? 'Akun Anda' : 'You'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-mono truncate">{u.email}</p>
                    {hasDedicated && (
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className="text-[11px] text-slate-400 font-mono">Dedicated:</span>
                        {u.dedicatedSdrs!.map(sdr => (
                          <span key={sdr} className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {sdr}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {/* Role Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">Role:</span>
                    <select
                      disabled={!canChangeRoles}
                      value={u.role}
                      onChange={e => onUpdateUserRole(u.email, e.target.value as Role)}
                      className={`text-xs font-bold font-mono px-3 py-1.5 rounded-xl border transition-all ${
                        canChangeRoles
                          ? 'bg-white border-slate-300 text-slate-900 cursor-pointer hover:border-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900'
                          : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <option value="Sales Manager">Sales Manager</option>
                      <option value="Coordinator">Coordinator</option>
                      <option value="Field Ops">Field Ops</option>
                      <option value="SDR">SDR</option>
                    </select>
                  </div>

                  {/* Dedicated SDR Button */}
                  {canChangeRoles && (
                    <button
                      onClick={() => handleOpenDedicated(u)}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <span>🎯</span>
                      <span>
                        {hasDedicated
                          ? (lang === 'id' ? `Atur SDR (${u.dedicatedSdrs!.length})` : `Assign SDR (${u.dedicatedSdrs!.length})`)
                          : (lang === 'id' ? '+ Atur SDR Khusus' : '+ Assign SDR')}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Dedicated SDR Sub-Dialog / Modal */}
      {editingDedicatedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-sans">
                  {lang === 'id' ? 'Atur Dedicated SDR' : 'Assign Dedicated SDRs'}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{editingDedicatedEmail}</p>
              </div>
              <button
                onClick={() => setEditingDedicatedEmail(null)}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <p className="text-xs text-slate-600 mb-3 font-sans">
                {lang === 'id'
                  ? 'Pilih SDR yang ditugaskan untuk dipantau dan dikelola oleh anggota ini:'
                  : 'Select the SDRs that this team member will monitor and manage:'}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
                {SDR_LIST.map(sdr => {
                  const isSelected = selectedSdrs.includes(sdr)
                  return (
                    <button
                      key={sdr}
                      type="button"
                      onClick={() => handleToggleSdr(sdr)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left flex items-center justify-between ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span>{sdr}</span>
                      <span>{isSelected ? '✓' : '+'}</span>
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedSdrs([])}
                  className="text-xs text-rose-600 hover:underline font-mono"
                >
                  {lang === 'id' ? 'Kosongkan Pilihan' : 'Clear Selection'}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingDedicatedEmail(null)}
                    className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleSaveDedicated}
                    disabled={savingEmail !== null}
                    className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-xs"
                  >
                    {savingEmail ? (lang === 'id' ? 'Menyimpan...' : 'Saving...') : (lang === 'id' ? 'Simpan Perubahan' : 'Save Changes')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TeamManageModal({
  currentUser,
  users,
  lang,
  onUpdateUserRole,
  onUpdateDedicatedSdrs,
  onClose,
}: {
  currentUser: User
  users: User[]
  lang: Language
  onUpdateUserRole: (email: string, newRole: Role) => void
  onUpdateDedicatedSdrs: (email: string, dedicated: string[]) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <span className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wider">Team Management</span>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 text-sm">✕</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <TeamManagementView
            currentUser={currentUser}
            users={users}
            lang={lang}
            onUpdateUserRole={onUpdateUserRole}
            onUpdateDedicatedSdrs={onUpdateDedicatedSdrs}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Profile Modal ───────────────────────────────────────────────────────────

function ProfileModal({
  user,
  lang,
  onChangeLang,
  onUpdateUser,
  onOpenTeamManage,
  onClose
}: {
  user: User
  lang: Language
  onChangeLang: (l: Language) => void
  onUpdateUser: (updated: Partial<User>) => void
  onOpenTeamManage?: () => void
  onClose: () => void
}) {
  const t = TRANSLATIONS[lang]
  const [tab, setTab] = useState<'profile' | 'password'>('profile')
  const [name, setName] = useState(user.name)
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl || '')
  const [dedicatedSdrs, setDedicatedSdrs] = useState<string[]>(user.dedicatedSdrs || [])
  const [newImageBase64, setNewImageBase64] = useState<string | null>(null)
  const [newImageMime, setNewImageMime] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Password fields
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPass, setChangingPass] = useState(false)

  const isSalesManager = user.role === 'Sales Manager'

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert(lang === 'id' ? "Ukuran file maksimal 5MB" : "File size cannot exceed 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setAvatarPreview(result)
      setNewImageBase64(result.split(',')[1])
      setNewImageMime(file.type)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    let finalAvatarUrl = avatarPreview

    if (newImageBase64 && newImageMime) {
      const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL
      if (scriptUrl) {
        try {
          const uploadRes = await fetch(scriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              action: 'upload_file',
              folderType: 'profile',
              fileName: `Profile_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`,
              mimeType: newImageMime,
              fileData: newImageBase64
            })
          })
          const uploadData = await uploadRes.json()
          if (uploadData && (uploadData.directUrl || uploadData.url)) {
            finalAvatarUrl = uploadData.directUrl || uploadData.url
          }
        } catch (uErr) {
          console.error("Upload error:", uErr)
        }
      }
    }

    const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL
    if (scriptUrl) {
      try {
        await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'update_profile',
            email: user.email,
            name,
            avatarUrl: finalAvatarUrl,
            dedicatedSdrs: isSalesManager ? dedicatedSdrs : user.dedicatedSdrs
          })
        })
      } catch (err) {
        console.error("Update profile error:", err)
      }
    }

    onUpdateUser({
      name,
      avatarUrl: finalAvatarUrl,
      dedicatedSdrs: isSalesManager ? dedicatedSdrs : user.dedicatedSdrs
    })
    setIsUpdating(false)
    alert(t.updateProfileSuccess)
    onClose()
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      alert(lang === 'id' ? "Password baru harus minimal 6 karakter." : "New password must be at least 6 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      alert(lang === 'id' ? "Konfirmasi password tidak cocok!" : "Passwords do not match!")
      return
    }

    setChangingPass(true)
    const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL
    if (!scriptUrl) {
      alert("URL Google Apps Script tidak diset.")
      setChangingPass(false)
      return
    }

    try {
      const res = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'change_password',
          email: user.email,
          oldPassword,
          newPassword
        })
      })
      const data = await res.json()
      if (data.success) {
        alert(lang === 'id' ? "Password berhasil diubah" : "Password changed successfully")
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
        onClose()
      } else {
        alert(data.error || (lang === 'id' ? "Gagal mengubah password." : "Failed to change password."))
      }
    } catch (err) {
      console.error(err)
      alert(lang === 'id' ? "Terjadi gangguan jaringan." : "Network communication error.")
    } finally {
      setChangingPass(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="relative h-24 bg-slate-900 p-4 flex items-start justify-between">
          <span className="px-2.5 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-md text-[11px] font-mono uppercase tracking-wider font-semibold">
            {user.role}
          </span>
          <div className="flex items-center gap-2">
            <LanguageToggle lang={lang} onChangeLang={onChangeLang} />
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-sm">✕</button>
          </div>
        </div>

        <div className="px-6 pb-2 -mt-10 flex items-end justify-between">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-800 flex items-center justify-center">
              {avatarPreview ? (
                <img src={getDirectImageUrl(avatarPreview)} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white">{name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          </div>

          <div className="flex gap-2 mb-1">
            {isSalesManager && onOpenTeamManage && (
              <button
                type="button"
                onClick={() => { onClose(); onOpenTeamManage() }}
                className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100"
              >
                {t.manageTeamTitle}
              </button>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-lg"
            >
              {t.uploadPhotoBtn}
            </button>
          </div>
        </div>

        <div className="px-6 pt-1">
          <h2 className="text-base font-bold text-slate-900">{name || 'User'}</h2>
          <p className="text-xs text-slate-500 font-mono">{user.email}</p>
        </div>

        <div className="flex border-b border-slate-200 bg-slate-50 mt-4">
          <button
            onClick={() => setTab('profile')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              tab === 'profile' ? 'border-slate-900 text-slate-900 bg-white' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {t.tabProfile}
          </button>
          <button
            onClick={() => setTab('password')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              tab === 'password' ? 'border-slate-900 text-slate-900 bg-white' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {t.tabPassword}
          </button>
        </div>

        <div className="p-6 max-h-[55vh] overflow-y-auto">
          {tab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <Field label={t.fullName} required>
                <input className="form-input font-medium" value={name} onChange={e => setName(e.target.value)} required />
              </Field>

              <Field label={t.roleAccess}>
                <input className="form-input bg-slate-100 cursor-not-allowed font-medium text-slate-600" value={user.role} disabled />
              </Field>

              {user.dedicatedSdrs && user.dedicatedSdrs.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-700">{lang === 'id' ? 'Dedicated SDR Anda:' : 'Your Dedicated SDRs:'}</p>
                  <p className="text-xs font-mono text-indigo-700 mt-1">{user.dedicatedSdrs.join(', ')}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-xs"
              >
                {isUpdating ? t.processing : t.saveProfileBtn}
              </button>
            </form>
          )}

          {tab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Field label={t.oldPass}>
                <input type="password" className="form-input" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="••••••" />
              </Field>
              <Field label={t.newPass} required>
                <input type="password" className="form-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={lang === 'id' ? 'Min. 6 karakter' : 'Min. 6 characters'} required />
              </Field>
              <Field label={t.confirmPass} required>
                <input type="password" className="form-input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder={lang === 'id' ? 'Ulangi password baru' : 'Re-type new password'} required />
              </Field>
              <button
                type="submit"
                disabled={changingPass}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-xs"
              >
                {changingPass ? t.processing : t.changePassBtn}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Approvals Page ───────────────────────────────────────────────────────────

function ApprovalRequests({
  requests,
  user,
  lang,
  onApprove,
  onReject,
}: {
  requests: EditRequest[]
  user: User
  lang: Language
  onApprove: (req: EditRequest) => void
  onReject: (req: EditRequest) => void
}) {
  const t = TRANSLATIONS[lang]
  const [selectedReq, setSelectedReq] = useState<EditRequest | null>(null)
  const pendingRequests = requests.filter(r => r.status === 'pending')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-sans">{t.approvalsTitle}</h1>
        <p className="text-sm text-slate-500 mt-1">{t.approvalsSub}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiCard
          label={t.pendingCount}
          value={String(pendingRequests.length)}
          sub={t.needsReview}
          icon={<IconApprovals className="w-5 h-5" />}
          variant="amber"
        />
        <KpiCard
          label={t.totalRequests}
          value={String(requests.length)}
          sub={t.allRequests}
          icon={<IconBuilding className="w-5 h-5" />}
          variant="indigo"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <p className="text-sm font-bold text-slate-900 font-sans">{t.queueTitle}</p>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full">
            {pendingRequests.length} Pending
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm font-mono">{t.noPendingReqs}</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingRequests.map(req => (
              <div key={req.requestId} className="p-5 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{req.businessName}</span>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                      SDR: {req.sdrName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-1">
                    {lang === 'id' ? 'Diajukan oleh' : 'Submitted by'}: <strong className="text-slate-700">{req.requesterName}</strong> ({req.requesterRole}) · {new Date(req.timestamp).toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedReq(req)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg shadow-2xs"
                  >
                    {t.reviewChanges}
                  </button>
                  <button
                    onClick={() => onApprove(req)}
                    className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg shadow-2xs"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onReject(req)}
                    className="px-3 py-1.5 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg border border-rose-200"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-sans">{t.reviewChanges}: {selectedReq.businessName}</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {lang === 'id' ? 'Pemohon' : 'Requester'}: {selectedReq.requesterName} ({selectedReq.requesterRole})
                </p>
              </div>
              <button onClick={() => setSelectedReq(null)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 text-sm">✕</button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs font-mono">
              <p className="text-slate-600 font-sans">{t.diffNote}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-700 uppercase tracking-wider">{lang === 'id' ? 'Data Saat Ini (Lama)' : 'Current Data'}</p>
                  <p><strong>{t.thHours}:</strong> {selectedReq.originalData?.hours || 0} hrs</p>
                  <p><strong>{t.thHardware}:</strong> {selectedReq.originalData?.hardware || '—'}</p>
                  <p><strong>{t.thRate}:</strong> ${selectedReq.originalData?.rate || 0}/hr</p>
                  <p><strong>{t.thCity}:</strong> {selectedReq.originalData?.city || '—'}</p>
                  <p><strong>{t.thPhone}:</strong> {selectedReq.originalData?.phone || '—'}</p>
                  <p><strong>Status:</strong> {selectedReq.originalData?.status || '—'}</p>
                </div>

                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
                  <p className="font-bold text-emerald-800 uppercase tracking-wider">{lang === 'id' ? 'Perubahan yang Diajukan (Baru)' : 'Proposed New Data'}</p>
                  <p><strong>{t.thHours}:</strong> {selectedReq.updatedData?.hours || 0} hrs</p>
                  <p><strong>{t.thHardware}:</strong> {selectedReq.updatedData?.hardware || '—'}</p>
                  <p><strong>{t.thRate}:</strong> ${selectedReq.updatedData?.rate || 0}/hr</p>
                  <p><strong>{t.thCity}:</strong> {selectedReq.updatedData?.city || '—'}</p>
                  <p><strong>{t.thPhone}:</strong> {selectedReq.updatedData?.phone || '—'}</p>
                  <p className="text-emerald-700 font-bold"><strong>Status:</strong> approved</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                onClick={() => { onReject(selectedReq); setSelectedReq(null) }}
                className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100"
              >
                {t.rejectRequest}
              </button>
              <button
                onClick={() => { onApprove(selectedReq); setSelectedReq(null) }}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-xs"
              >
                {t.approveAndApply}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({
  businesses,
  rawShootLogs = [],
  user,
  lang
}: {
  businesses: Business[]
  rawShootLogs?: RawShootLogItem[]
  user?: User | null
  lang: Language
}) {
  const t = TRANSLATIONS[lang]

  // Filter businesses and shoot logs scoped to the current user (SDR sees only their own)
  const userBusinesses = useMemo(() => {
    return businesses.filter(b => canViewBusiness(user, b))
  }, [businesses, user])

  const userShootLogs = useMemo(() => {
    return rawShootLogs.filter(l => canViewBusiness(user, { sdrName: l.sdrName }))
  }, [rawShootLogs, user])

  const [datePreset, setDatePreset] = useState<'all' | 'today' | 'this_week' | 'this_month' | 'last_month' | 'last_30' | 'custom'>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')

  // Quick preset helper
  const handlePresetChange = (preset: 'all' | 'today' | 'this_week' | 'this_month' | 'last_month' | 'last_30' | 'custom') => {
    setDatePreset(preset)
    setSelectedMonth('')
    const now = new Date()
    if (preset === 'all') {
      setStartDate('')
      setEndDate('')
    } else if (preset === 'today') {
      const todayStr = now.toISOString().split('T')[0]
      setStartDate(todayStr)
      setEndDate(todayStr)
    } else if (preset === 'this_week') {
      const day = now.getDay()
      const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1)
      const monday = new Date(now.setDate(diffToMonday))
      const sunday = new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000)
      setStartDate(monday.toISOString().split('T')[0])
      setEndDate(sunday.toISOString().split('T')[0])
    } else if (preset === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      setStartDate(firstDay.toISOString().split('T')[0])
      setEndDate(lastDay.toISOString().split('T')[0])
    } else if (preset === 'last_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
      setStartDate(firstDay.toISOString().split('T')[0])
      setEndDate(lastDay.toISOString().split('T')[0])
    } else if (preset === 'last_30') {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      setStartDate(past.toISOString().split('T')[0])
      setEndDate(now.toISOString().split('T')[0])
    }
  }

  const handleMonthChange = (monthStr: string) => {
    setSelectedMonth(monthStr)
    if (!monthStr) {
      handlePresetChange('all')
      return
    }
    setDatePreset('custom')
    const [year, month] = monthStr.split('-').map(Number)
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(lastDay.toISOString().split('T')[0])
  }

  // Filter raw shoot logs within date range
  const dateFilteredShootLogs = useMemo(() => {
    if (!startDate && !endDate) return userShootLogs
    const start = startDate ? new Date(startDate) : null
    if (start) start.setHours(0, 0, 0, 0)
    const end = endDate ? new Date(endDate) : null
    if (end) end.setHours(23, 59, 59, 999)

    return userShootLogs.filter(log => {
      if (!log.parsedDate) return true
      if (start && log.parsedDate < start) return false
      if (end && log.parsedDate > end) return false
      return true
    })
  }, [userShootLogs, startDate, endDate])

  // Filter businesses by submission / shoot date
  const filteredBusinesses = useMemo(() => {
    if (!startDate && !endDate) return userBusinesses

    const start = startDate ? new Date(startDate) : null
    if (start) start.setHours(0, 0, 0, 0)
    const end = endDate ? new Date(endDate) : null
    if (end) end.setHours(23, 59, 59, 999)

    // Set of business names that have shoot logs in the selected date range
    const activeBizInShoots = new Set(dateFilteredShootLogs.map(l => l.businessName.trim().toLowerCase()))

    return userBusinesses.filter(b => {
      const bKey = (b.businessName || '').trim().toLowerCase()
      if (activeBizInShoots.has(bKey)) return true
      const sDate = parseAnyDate(b.submissionDate) || parseAnyDate(b.shootLastDate)
      if (!sDate) return false
      if (start && sDate < start) return false
      if (end && sDate > end) return false
      return true
    })
  }, [userBusinesses, dateFilteredShootLogs, startDate, endDate])

  // Total running businesses calculated strictly from status === 'Running'
  const runningBusinesses = useMemo(() => {
    return filteredBusinesses.filter(b => b.status === 'Running')
  }, [filteredBusinesses])

  // Hardware distribution for pie chart
  const hwData = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredBusinesses.forEach(b => {
      const hw = b.hardware || 'MC'
      counts[hw] = (counts[hw] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [filteredBusinesses])

  // Monthly submissions / shoots trend
  const monthData = useMemo(() => {
    const months: Record<string, number> = {}
    filteredBusinesses.forEach(b => {
      const d = parseAnyDate(b.submissionDate) || parseAnyDate(b.shootLastDate)
      if (d) {
        const key = d.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { month: 'short', year: 'numeric' })
        months[key] = (months[key] || 0) + 1
      }
    })
    return Object.entries(months).map(([name, total]) => ({ name, total }))
  }, [filteredBusinesses, lang])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans">{t.dashTitle}</h1>
          <p className="text-sm text-slate-500 mt-1">{t.dashSub}</p>
        </div>

        {/* Date Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => handlePresetChange('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                datePreset === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.filterAllTime}
            </button>
            <button
              onClick={() => handlePresetChange('today')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                datePreset === 'today' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.filterToday}
            </button>
            <button
              onClick={() => handlePresetChange('this_week')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                datePreset === 'this_week' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.filterThisWeek}
            </button>
            <button
              onClick={() => handlePresetChange('this_month')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                datePreset === 'this_month' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.filterThisMonth}
            </button>
            <button
              onClick={() => handlePresetChange('last_month')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                datePreset === 'last_month' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.filterLastMonth}
            </button>
            <button
              onClick={() => handlePresetChange('last_30')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                datePreset === 'last_30' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.filterLast30Days}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pl-2 border-l border-slate-200">
            {/* Month Picker */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-500 font-mono hidden md:inline">{t.filterMonth}:</span>
              <input
                type="month"
                className="form-input text-xs py-1 px-2 font-mono w-32"
                value={selectedMonth}
                onChange={e => handleMonthChange(e.target.value)}
              />
            </div>

            {/* Custom Range */}
            <div className="flex items-center gap-1">
              <IconCalendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                title={t.filterStartDate}
                className="form-input text-xs py-1 px-2 w-32 font-mono"
                value={startDate}
                onChange={e => { setStartDate(e.target.value); setDatePreset('custom'); setSelectedMonth('') }}
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="date"
                title={t.filterEndDate}
                className="form-input text-xs py-1 px-2 w-32 font-mono"
                value={endDate}
                onChange={e => { setEndDate(e.target.value); setDatePreset('custom'); setSelectedMonth('') }}
              />
            </div>

            {(startDate || endDate || selectedMonth) && (
              <button
                onClick={() => handlePresetChange('all')}
                className="text-xs text-rose-600 hover:underline ml-1 font-semibold px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200"
                title={t.clearFilters}
              >
                ✕ {t.clearFilters}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label={t.totalBusinesses}
          value={String(filteredBusinesses.length)}
          sub={startDate || endDate ? `${filteredBusinesses.length} ${lang === 'id' ? 'pada periode terpilih' : 'in selected period'}` : t.allEntries}
          icon={<IconBuilding className="w-5 h-5" />}
          variant="indigo"
        />
        <KpiCard
          label={t.runningBusinesses}
          value={String(runningBusinesses.length)}
          sub={lang === 'id' ? 'Status Running' : 'Running status'}
          icon={<IconShieldCheck className="w-5 h-5" />}
          variant="emerald"
        />
        <KpiCard
          label={lang === 'id' ? 'Menunggu Approval' : 'Pending Approval'}
          value={String(filteredBusinesses.filter(b => b.status === 'pending').length)}
          sub={lang === 'id' ? 'Membutuhkan verifikasi' : 'Requires verification'}
          icon={<IconApprovals className="w-5 h-5" />}
          variant="amber"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 font-sans mb-1">{t.runningBizPerMonth}</h3>
          <p className="text-xs text-slate-500 font-mono mb-4">{t.runningBizSub}</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hardware Pie */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 font-sans mb-1">{t.hardwareDistribution}</h3>
          <p className="text-xs text-slate-500 font-mono mb-4">{lang === 'id' ? 'Komposisi tipe kit pada seluruh bisnis terdaftar' : 'Kit type breakdown across all registered businesses'}</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={hwData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {hwData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={HARDWARE_COLORS[entry.name as Hardware] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── All Businesses ───────────────────────────────────────────────────────────

function AllBusinesses({
  businesses,
  user,
  lang,
  onAdd,
  onEdit,
  onDelete,
  onView,
  onQuickToggleStatus,
  onSyncShootStatus,
  isSyncingShootStatus,
}: {
  businesses: Business[]
  user: User
  lang: Language
  onAdd: () => void
  onEdit: (b: Business) => void
  onDelete: (b: Business) => void
  onView: (b: Business) => void
  onQuickToggleStatus: (b: Business, newStatus: Status) => void
  onSyncShootStatus: () => void
  isSyncingShootStatus: boolean
}) {
  const t = TRANSLATIONS[lang]
  const [search, setSearch] = useState('')
  const [sdrFilter, setSdrFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  const userBusinesses = useMemo(() => {
    return businesses.filter(b => canViewBusiness(user, b))
  }, [businesses, user])

  const filtered = useMemo(() => {
    return userBusinesses.filter(b => {
      const matchSearch = b.businessName.toLowerCase().includes(search.toLowerCase()) ||
        (b.city && b.city.toLowerCase().includes(search.toLowerCase())) ||
        (b.sdrName && b.sdrName.toLowerCase().includes(search.toLowerCase()))
      const matchSDR = sdrFilter === 'All' || b.sdrName === sdrFilter
      const matchStatus = statusFilter === 'All' || b.status === statusFilter
      return matchSearch && matchSDR && matchStatus
    })
  }, [userBusinesses, search, sdrFilter, statusFilter])

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans">{t.allBizTitle}</h1>
          <p className="text-xs text-slate-500 font-mono mt-1">{t.entriesCount(filtered.length, userBusinesses.length)}</p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-colors shadow-xs"
          >
            {t.addBusiness}
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <input
            className="form-input text-xs"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {user.role !== 'SDR' ? (
          <div className="w-40">
            <select className="form-input text-xs" value={sdrFilter} onChange={e => setSdrFilter(e.target.value)}>
              <option value="All">{t.allSdrs}</option>
              {SDR_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ) : (
          <div className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 font-mono">
            SDR: {user.name}
          </div>
        )}
        <div className="w-44">
          <select className="form-input text-xs" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">{t.allStatuses}</option>
            <option value="Running">{getStatusLabel('Running', lang)}</option>
            <option value="approved">{getStatusLabel('approved', lang)}</option>
            <option value="pending">{getStatusLabel('pending', lang)}</option>
            <option value="canceled">{getStatusLabel('canceled', lang)}</option>
            <option value="Stopped">{getStatusLabel('Stopped', lang)}</option>
            <option value="Fraud">{getStatusLabel('Fraud', lang)}</option>
          </select>
        </div>
        {(search || sdrFilter !== 'All' || statusFilter !== 'All') && (
          <button
            onClick={() => { setSearch(''); setSdrFilter('All'); setStatusFilter('All') }}
            className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
          >
            {t.clearFilters}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {[t.thBizName, t.thSdr, t.thDate, t.thHours, t.thHardware, t.thRate, t.thCity, t.thShootProgress, t.thStatus, t.thActions].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-slate-500 font-semibold uppercase tracking-wider font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500 font-mono">{t.noBizFound}</td>
                </tr>
              ) : (
                filtered.map(b => {
                  const shootH = b.shootHours || 0
                  const isRunningShoot = shootH > 0
                  const isMaxShoot = b.hours > 0 && shootH >= b.hours * 0.9

                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-900 text-xs">{b.businessName}</p>
                        {b.hasPendingEdit && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 text-[9px] font-mono font-bold bg-amber-100 text-amber-800 rounded">
                            {t.editPending}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-medium">{b.sdrName}</td>
                      <td className="px-5 py-3.5 text-slate-500 font-mono">{b.submissionDate}</td>
                      <td className="px-5 py-3.5 font-mono text-slate-900 font-semibold">{b.hours} hrs</td>
                      <td className="px-5 py-3.5 font-mono">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-bold border"
                          style={{
                            backgroundColor: (HARDWARE_COLORS[b.hardware] || '#4f46e5') + '15',
                            borderColor: (HARDWARE_COLORS[b.hardware] || '#4f46e5') + '35',
                            color: HARDWARE_COLORS[b.hardware] || '#4f46e5'
                          }}
                        >
                          {b.hardware}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-700">${b.rate}/hr</td>
                      <td className="px-5 py-3.5 text-slate-500">{b.city || '—'}</td>

                      {/* Shoot Progress Badge */}
                      <td className="px-5 py-3.5 font-mono">
                        <div className="flex flex-col">
                          <span className={`inline-flex items-center gap-1 font-bold ${
                            isMaxShoot ? 'text-emerald-700' : isRunningShoot ? 'text-indigo-700' : 'text-slate-400'
                          }`}>
                            {shootH}h / {b.hours}h
                          </span>
                          <span className="text-[10px] text-slate-500 font-sans">
                            {isMaxShoot ? t.statusMaksimal : isRunningShoot ? t.statusBerjalan : t.statusStopped}
                          </span>
                        </div>
                      </td>
                      
                      {/* Status Dropdown (Quick toggle - only if user can edit this business) */}
                      <td className="px-5 py-3.5">
                        {canEditBusiness(user, b) ? (
                          <select
                            value={b.status}
                            onChange={e => onQuickToggleStatus(b, e.target.value as Status)}
                            className={`text-[11px] font-bold font-mono px-2 py-1 rounded-lg border cursor-pointer ${STATUS_COLORS[b.status] || STATUS_COLORS.Running}`}
                          >
                            <option value="Running">{getStatusLabel('Running', lang)}</option>
                            <option value="approved">{getStatusLabel('approved', lang)}</option>
                            <option value="pending">{getStatusLabel('pending', lang)}</option>
                            <option value="canceled">{getStatusLabel('canceled', lang)}</option>
                            <option value="Stopped">{getStatusLabel('Stopped', lang)}</option>
                            <option value="Fraud">{getStatusLabel('Fraud', lang)}</option>
                          </select>
                        ) : (
                          <span className={`inline-flex text-[11px] font-bold font-mono px-2 py-1 rounded-lg border ${STATUS_COLORS[b.status] || STATUS_COLORS.Running}`}>
                            {getStatusLabel(b.status, lang)}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => onView(b)} className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md">
                            {lang === 'id' ? 'Lihat' : 'View'}
                          </button>
                          {canEditBusiness(user, b) && (
                            <button onClick={() => onEdit(b)} className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md">
                              Edit
                            </button>
                          )}
                          {(user.role === 'Sales Manager' || user.role === 'Coordinator') && (
                            <button onClick={() => onDelete(b)} className="p-1 text-slate-400 hover:text-rose-600 rounded" title={lang === 'id' ? 'Hapus' : 'Delete'}>
                              <IconTrash className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── SDR Directory ────────────────────────────────────────────────────────────

function SDRDirectory({
  businesses,
  user,
  rawShootLogs = [],
  lang
}: {
  businesses: Business[]
  user?: User | null
  rawShootLogs?: RawShootLogItem[]
  lang: Language
}) {
  const t = TRANSLATIONS[lang]
  const [expandedSdr, setExpandedSdr] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const runningBizCount = useMemo(() => {
    return businesses.filter(b => b.status === 'Running').length
  }, [businesses])

  const baseSdrList = useMemo(() => {
    if (user?.role === 'SDR' && user.name) {
      return [user.name]
    }
    return SDR_LIST
  }, [user])

  const filteredSdrList = useMemo(() => {
    if (!search.trim()) return baseSdrList
    return baseSdrList.filter(sdr => sdr.toLowerCase().includes(search.toLowerCase()))
  }, [baseSdrList, search])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans">{t.sdrDirectoryTitle}</h1>
          <p className="text-sm text-slate-500 mt-1 font-mono">{t.sdrDirectorySub}</p>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            className="form-input text-xs w-full"
            placeholder={lang === 'id' ? 'Cari nama SDR...' : 'Search SDR name...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Top SDR Overall KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-sans">{lang === 'id' ? 'Total SDR Aktif' : 'Total Active SDRs'}</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{SDR_LIST.length} SDR</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold font-mono">
            👥
          </div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-sans">{lang === 'id' ? 'Total Bisnis Portofolio' : 'Total Portfolio Businesses'}</p>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">{businesses.length} Bisnis</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold font-mono">
            🏢
          </div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-sans">{lang === 'id' ? 'Total Bisnis Running' : 'Running Businesses'}</p>
            <p className="text-xl font-bold text-purple-600 mt-0.5">{runningBizCount} Bisnis</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold font-mono">
            ⚡
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSdrList.map(sdr => {
          const sdrBiz = businesses.filter(b => b.sdrName.toLowerCase() === sdr.toLowerCase())
          const running = sdrBiz.filter(b => b.status === 'Running').length
          const isExpanded = expandedSdr === sdr

          return (
            <div key={sdr} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center font-mono text-sm">
                      {sdr.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{sdr}</h3>
                      <p className="text-xs text-slate-500 font-mono">SDR Tangerang</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedSdr(isExpanded ? null : sdr)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                  >
                    {isExpanded ? (lang === 'id' ? 'Tutup' : 'Hide') : (lang === 'id' ? 'Lihat Bisnis' : 'View Biz')}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center font-mono mb-3">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">{t.sdrTotalBiz}</p>
                    <p className="font-bold text-slate-900 text-sm">{sdrBiz.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">{t.sdrRunningBiz}</p>
                    <p className="font-bold text-emerald-600 text-sm">{running}</p>
                  </div>
                </div>

                {/* Expanded SDR Portfolio */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 font-mono uppercase">
                      {lang === 'id' ? `Portofolio Bisnis (${sdrBiz.length})` : `Business Portfolio (${sdrBiz.length})`}
                    </p>
                    {sdrBiz.length === 0 ? (
                      <p className="text-xs text-slate-400 font-mono italic">{lang === 'id' ? 'Belum ada bisnis yang ditugaskan' : 'No businesses assigned'}</p>
                    ) : (
                      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                        {sdrBiz.map(b => (
                          <div key={b.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs font-mono border border-slate-100">
                            <div className="min-w-0 flex-1 pr-2">
                              <p className="font-bold text-slate-800 truncate">{b.businessName}</p>
                              <p className="text-[10px] text-slate-400">{b.city || 'Tangerang'}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                b.status === 'Running' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                              }`}>
                                {b.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Shoot Report (Categorized by Business, View Only, with Date Filter) ──────

function ShootReport({
  businessGroups,
  businesses,
  user,
  lang,
  loadingShootData,
  onRefreshShootData,
}: {
  businessGroups: ShootBusinessGroup[]
  businesses: Business[]
  user?: User | null
  lang: Language
  loadingShootData: boolean
  onRefreshShootData: () => void
}) {
  const t = TRANSLATIONS[lang]
  const [search, setSearch] = useState('')
  const [sdrFilter, setSdrFilter] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Maksimal' | 'Sedang Berjalan' | 'Stopped'>('All')
  const [expandedBiz, setExpandedBiz] = useState<string | null>(null)

  // Filter groups scoped to current user (SDR sees only their own)
  const userBusinessGroups = useMemo(() => {
    return businessGroups.filter(bg => canViewBusiness(user, { sdrName: bg.crmSdr }))
  }, [businessGroups, user])

  // Date Range State
  const [datePreset, setDatePreset] = useState<'all' | 'today' | 'this_week' | 'this_month' | 'last_month' | 'last_30' | 'custom'>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')

  const handlePresetChange = (preset: 'all' | 'today' | 'this_week' | 'this_month' | 'last_month' | 'last_30' | 'custom') => {
    setDatePreset(preset)
    setSelectedMonth('')
    const now = new Date()
    if (preset === 'all') {
      setStartDate('')
      setEndDate('')
    } else if (preset === 'today') {
      const todayStr = now.toISOString().split('T')[0]
      setStartDate(todayStr)
      setEndDate(todayStr)
    } else if (preset === 'this_week') {
      const day = now.getDay()
      const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1)
      const monday = new Date(now.setDate(diffToMonday))
      const sunday = new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000)
      setStartDate(monday.toISOString().split('T')[0])
      setEndDate(sunday.toISOString().split('T')[0])
    } else if (preset === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      setStartDate(firstDay.toISOString().split('T')[0])
      setEndDate(lastDay.toISOString().split('T')[0])
    } else if (preset === 'last_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
      setStartDate(firstDay.toISOString().split('T')[0])
      setEndDate(lastDay.toISOString().split('T')[0])
    } else if (preset === 'last_30') {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      setStartDate(past.toISOString().split('T')[0])
      setEndDate(now.toISOString().split('T')[0])
    }
  }

  const handleMonthChange = (monthStr: string) => {
    setSelectedMonth(monthStr)
    if (!monthStr) {
      handlePresetChange('all')
      return
    }
    setDatePreset('custom')
    const [year, month] = monthStr.split('-').map(Number)
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(lastDay.toISOString().split('T')[0])
  }

  // Recalculate business groups based on the active date filter
  const dateFilteredGroups = useMemo(() => {
    const start = startDate ? new Date(startDate) : null
    if (start) start.setHours(0, 0, 0, 0)
    const end = endDate ? new Date(endDate) : null
    if (end) end.setHours(23, 59, 59, 999)

    return userBusinessGroups.map(bg => {
      // Accumulate across kits matching the date filter
      const filteredKits = bg.kits.map(kit => {
        const matchingLogs = kit.logs.filter(log => {
          if (!startDate && !endDate) return true
          if (!log.parsedDate) return true
          if (start && log.parsedDate < start) return false
          if (end && log.parsedDate > end) return false
          return true
        })

        const kitHours = Math.round(matchingLogs.reduce((s, l) => s + l.hours, 0) * 100) / 100
        const kitVideos = matchingLogs.reduce((s, l) => s + l.videos, 0)
        const utilPercent = kit.targetHours > 0 ? Math.min(100, Math.round((kitHours / kit.targetHours) * 100)) : 0
        const isMaximal = (kit.targetHours > 0 && kitHours >= kit.targetHours * 0.9) || (kitHours > 0 && kit.targetHours === 0)

        // Find last report date within matching logs
        let latestLogDate = ''
        if (matchingLogs.length > 0) {
          const sorted = [...matchingLogs].sort((a, b) => {
            if (!a.parsedDate || !b.parsedDate) return 0
            return b.parsedDate.getTime() - a.parsedDate.getTime()
          })
          latestLogDate = sorted[0].date
        }

        return {
          ...kit,
          totalHours: kitHours,
          totalVideos: kitVideos,
          utilPercent,
          isMaximal,
          lastDate: latestLogDate || kit.lastDate,
          logs: matchingLogs
        }
      })

      // Total accumulation from all kits in this business
      const totalBizHours = Math.round(filteredKits.reduce((s, k) => s + k.totalHours, 0) * 100) / 100
      const totalBizVideos = filteredKits.reduce((s, k) => s + k.totalVideos, 0)
      const utilPercent = bg.targetHours > 0 ? Math.min(100, Math.round((totalBizHours / bg.targetHours) * 100)) : 0
      
      // Determine shoot operational status:
      // If 0 hours / no reports in this period -> Stopped
      let shootStatus: 'Maksimal' | 'Sedang Berjalan' | 'Stopped' = 'Stopped'
      if (totalBizHours > 0) {
        if (bg.targetHours > 0 && totalBizHours >= bg.targetHours * 0.9) {
          shootStatus = 'Maksimal'
        } else {
          shootStatus = 'Sedang Berjalan'
        }
      }

      return {
        ...bg,
        totalHours: totalBizHours,
        totalVideos: totalBizVideos,
        utilPercent,
        shootStatus,
        hasRecentReport: totalBizHours > 0,
        kits: filteredKits
      }
    })
  }, [userBusinessGroups, startDate, endDate])

  // Filter groups by search, sdr, and shootStatus
  const finalFilteredGroups = useMemo(() => {
    return dateFilteredGroups.filter(bg => {
      const matchSearch = bg.businessName.toLowerCase().includes(search.toLowerCase()) ||
        bg.crmSdr.toLowerCase().includes(search.toLowerCase()) ||
        (bg.city && bg.city.toLowerCase().includes(search.toLowerCase()))
      const matchSdr = sdrFilter === 'All' || bg.crmSdr === sdrFilter
      const matchStatus = statusFilter === 'All' || bg.shootStatus === statusFilter
      return matchSearch && matchSdr && matchStatus
    })
  }, [dateFilteredGroups, search, sdrFilter, statusFilter])

  // Aggregate Metrics across all businesses
  const totalShootHoursAll = useMemo(() => {
    return Math.round(finalFilteredGroups.reduce((s, bg) => s + bg.totalHours, 0) * 100) / 100
  }, [finalFilteredGroups])

  const totalVideosAll = useMemo(() => {
    return finalFilteredGroups.reduce((s, bg) => s + bg.totalVideos, 0)
  }, [finalFilteredGroups])

  const totalMaximalCount = finalFilteredGroups.filter(bg => bg.shootStatus === 'Maksimal').length
  const totalRunningCount = finalFilteredGroups.filter(bg => bg.shootStatus === 'Sedang Berjalan').length
  const totalStoppedCount = finalFilteredGroups.filter(bg => bg.shootStatus === 'Stopped').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-sans">
              {t.shootTitle}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-mono">
            {t.shootSub}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefreshShootData}
            disabled={loadingShootData}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-all"
          >
            <IconRefresh className="w-3.5 h-3.5" spinning={loadingShootData} />
            <span>{loadingShootData ? (lang === 'id' ? 'Memuat Sheet...' : 'Loading Sheet...') : (lang === 'id' ? 'Refresh Data' : 'Refresh Data')}</span>
          </button>
        </div>
      </div>

      {/* Date Filter Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-700 font-sans mr-1">{t.filterDateRange}:</span>
          <button
            onClick={() => handlePresetChange('all')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              datePreset === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.filterAllTime}
          </button>
          <button
            onClick={() => handlePresetChange('today')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              datePreset === 'today' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.filterToday}
          </button>
          <button
            onClick={() => handlePresetChange('this_week')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              datePreset === 'this_week' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.filterThisWeek}
          </button>
          <button
            onClick={() => handlePresetChange('this_month')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              datePreset === 'this_month' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.filterThisMonth}
          </button>
          <button
            onClick={() => handlePresetChange('last_month')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              datePreset === 'last_month' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.filterLastMonth}
          </button>
          <button
            onClick={() => handlePresetChange('last_30')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              datePreset === 'last_30' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.filterLast30Days}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month Picker */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-500 font-mono hidden md:inline">{t.filterMonth}:</span>
            <input
              type="month"
              className="form-input text-xs py-1 px-2 font-mono w-32"
              value={selectedMonth}
              onChange={e => handleMonthChange(e.target.value)}
            />
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center gap-1">
            <IconCalendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              title={t.filterStartDate}
              className="form-input text-xs py-1 px-2 w-32 font-mono"
              value={startDate}
              onChange={e => { setStartDate(e.target.value); setDatePreset('custom'); setSelectedMonth('') }}
            />
            <span className="text-slate-400 text-xs">-</span>
            <input
              type="date"
              title={t.filterEndDate}
              className="form-input text-xs py-1 px-2 w-32 font-mono"
              value={endDate}
              onChange={e => { setEndDate(e.target.value); setDatePreset('custom'); setSelectedMonth('') }}
            />
          </div>

          {(startDate || endDate || selectedMonth) && (
            <button
              onClick={() => handlePresetChange('all')}
              className="text-xs text-rose-600 hover:underline ml-1 font-semibold px-2 py-1 rounded bg-rose-50 border border-rose-200"
              title={t.clearFilters}
            >
              ✕ {t.clearFilters}
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label={lang === 'id' ? 'Total Bisnis di Portofolio' : 'Total Portfolio Businesses'}
          value={String(finalFilteredGroups.length)}
          sub={lang === 'id' ? 'Terkategori per bisnis' : 'Categorized per business'}
          icon={<IconBuilding className="w-5 h-5" />}
          variant="indigo"
        />
        <KpiCard
          label={t.totalLoggedShoot}
          value={`${formatNumber(totalShootHoursAll)} hrs`}
          sub={startDate || endDate ? (lang === 'id' ? 'Akumulasi pada periode terpilih' : 'Accumulated in selected period') : (lang === 'id' ? 'Akumulasi dari seluruh kit' : 'Accumulated across all kits')}
          icon={<IconDashboard className="w-5 h-5" />}
          variant="emerald"
        />
        <KpiCard
          label={lang === 'id' ? 'Total Video Terekam' : 'Total Recorded Videos'}
          value={`${formatNumber(totalVideosAll)} Video`}
          sub={lang === 'id' ? 'Akumulasi dari seluruh kit' : 'Accumulated across all kits'}
          icon={<IconCamera className="w-5 h-5" />}
          variant="purple"
        />
        <KpiCard
          label={lang === 'id' ? 'Status Operasional Shoot' : 'Shoot Status Breakdown'}
          value={`${totalRunningCount + totalMaximalCount} Aktif`}
          sub={lang === 'id' ? `${totalMaximalCount} maksimal · ${totalRunningCount} berjalan · ${totalStoppedCount} stopped` : `${totalMaximalCount} max · ${totalRunningCount} running · ${totalStoppedCount} stopped`}
          icon={<IconShieldCheck className="w-5 h-5" />}
          variant="amber"
        />
      </div>

      {/* Search & Secondary Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
          <input
            className="form-input text-xs flex-1 min-w-[180px]"
            placeholder={lang === 'id' ? 'Cari nama bisnis, kota, atau SDR...' : 'Search by business name, city, or SDR...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {user?.role !== 'SDR' ? (
            <select
              className="form-input text-xs w-44"
              value={sdrFilter}
              onChange={e => setSdrFilter(e.target.value)}
            >
              <option value="All">{t.allSdrs}</option>
              {SDR_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          ) : (
            <div className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 font-mono">
              SDR: {user.name}
            </div>
          )}
          <select
            className="form-input text-xs w-48 font-mono"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
          >
            <option value="All">{lang === 'id' ? 'Semua Status Shoot' : 'All Shoot Statuses'}</option>
            <option value="Maksimal">{t.statusMaksimal} (≥ 90%)</option>
            <option value="Sedang Berjalan">{t.statusBerjalan} (&gt; 0h)</option>
            <option value="Stopped">{t.statusStopped} (0h)</option>
          </select>
        </div>

        {(search || sdrFilter !== 'All' || statusFilter !== 'All') && (
          <button
            onClick={() => { setSearch(''); setSdrFilter('All'); setStatusFilter('All') }}
            className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
          >
            {t.clearFilters}
          </button>
        )}
      </div>

      {/* Business Groups Accordion View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-700 font-mono uppercase tracking-wider">
            {lang === 'id' ? `Daftar Bisnis (${finalFilteredGroups.length} Bisnis Terdaftar)` : `Business Roster (${finalFilteredGroups.length} Businesses)`}
          </p>
        </div>

        {loadingShootData && businessGroups.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs font-mono flex flex-col items-center justify-center gap-2">
            <IconRefresh className="w-5 h-5 animate-spin text-indigo-600" />
            <span>{lang === 'id' ? 'Sedang memuat dan mengorganisasi data Shoot Report...' : 'Loading and organizing Shoot Report data...'}</span>
          </div>
        ) : finalFilteredGroups.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs font-mono flex flex-col items-center justify-center gap-3">
            <p>{lang === 'id' ? 'Tidak ada bisnis yang cocok dengan filter pencarian / tanggal ini.' : 'No businesses match the search/date filter criteria.'}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { handlePresetChange('all'); setSearch(''); setSdrFilter('All'); setStatusFilter('All') }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                {lang === 'id' ? 'Reset Semua Filter' : 'Reset All Filters'}
              </button>
              <button
                onClick={onRefreshShootData}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <IconRefresh className="w-3.5 h-3.5" spinning={loadingShootData} />
                <span>{lang === 'id' ? 'Muat Ulang Data' : 'Reload Data'}</span>
              </button>
            </div>
          </div>
        ) : (
          finalFilteredGroups.map(bg => {
            const isExpanded = expandedBiz === bg.businessName

            return (
              <div key={bg.businessName} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Info: Business & SDR details */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => setExpandedBiz(isExpanded ? null : bg.businessName)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0 mt-0.5"
                      title={isExpanded ? t.collapseKits : t.expandKits}
                    >
                      <span className={`inline-block transition-transform text-xs ${isExpanded ? 'rotate-90 text-indigo-600' : ''}`}>▶</span>
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {bg.businessName}
                        </span>

                        {/* Shoot status badge: Stopped if 0 hours / no reports */}
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                          bg.shootStatus === 'Maksimal'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : bg.shootStatus === 'Sedang Berjalan'
                            ? 'bg-indigo-50 text-indigo-800 border border-indigo-300'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {bg.shootStatus === 'Maksimal'
                            ? t.statusMaksimal
                            : bg.shootStatus === 'Sedang Berjalan'
                            ? t.statusBerjalan
                            : t.statusStopped}
                        </span>

                        {/* CRM Status badge */}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${STATUS_COLORS[bg.crmStatus] || STATUS_COLORS.Running}`}>
                          CRM: {getStatusLabel(bg.crmStatus, lang)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1">
                        SDR: <strong className="text-slate-800">{bg.crmSdr}</strong> {bg.city ? `· ${bg.city}` : ''} · <span className="font-mono text-indigo-700 font-semibold">{bg.kitsCount} {lang === 'id' ? 'Kit Terhubung' : 'Connected Kits'}</span>
                        {bg.lastReportDate && (
                          <span className="text-slate-500 ml-2 font-mono">
                            ({t.bizLastReport}: {bg.lastReportDate})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right Metrics: Total accumulated shoot duration from ALL kits */}
                  <div className="flex items-center justify-between lg:justify-end gap-5 shrink-0 pl-7 lg:pl-0 font-mono">
                    <div className="text-right">
                      <div className="flex justify-end gap-3 text-xs mb-1 items-baseline">
                        <div>
                          <span className="text-xs text-slate-400 mr-1">{lang === 'id' ? 'Akumulasi:' : 'Total:'}</span>
                          <span className="text-slate-900 font-extrabold text-sm">{bg.totalHours} hrs</span>
                        </div>
                        <span className="text-slate-400 font-normal">Target: {bg.targetHours > 0 ? `${bg.targetHours}h` : '—'}</span>
                      </div>
                      <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className={`h-full rounded-full transition-all ${
                            bg.shootStatus === 'Maksimal'
                              ? 'bg-emerald-500'
                              : bg.shootStatus === 'Sedang Berjalan'
                              ? 'bg-indigo-600'
                              : 'bg-slate-300'
                          }`}
                          style={{ width: `${Math.min(100, bg.utilPercent || (bg.totalHours > 0 ? 50 : 0))}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        {bg.totalVideos} Video terakumulasi dari {bg.kits.length} Kit
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedBiz(isExpanded ? null : bg.businessName)}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <span>{isExpanded ? (lang === 'id' ? 'Tutup Rincian' : 'Hide Kits') : (lang === 'id' ? 'Rincian Kit' : 'View Kits')}</span>
                        <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded font-mono font-bold">{bg.kits.length}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Kit Breakdown for this Business */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wider">
                        {lang === 'id' ? `Akumulasi Seluruh Kit — ${bg.businessName} (${bg.totalHours} hrs / ${bg.totalVideos} video)` : `Kit Accumulation Breakdown — ${bg.businessName} (${bg.totalHours} hrs / ${bg.totalVideos} videos)`}
                      </p>
                      <span className="text-[11px] font-mono text-slate-500">
                        {bg.kits.length} {lang === 'id' ? 'Kit terdaftar pada bisnis ini' : 'kits registered for this business'}
                      </span>
                    </div>

                    {bg.kits.length === 0 ? (
                      <p className="p-4 bg-slate-50 rounded-xl text-xs text-slate-400 font-mono text-center">
                        {t.noLogs}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {bg.kits.map(k => (
                          <div key={k.kitCode} className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200 space-y-2 text-xs">
                            <div className="flex items-center justify-between flex-wrap gap-2 font-mono">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded">
                                  📦 {k.kitCode}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                  k.isMaximal
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : k.totalHours > 0
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : 'bg-slate-200 text-slate-700'
                                }`}>
                                  {k.totalHours} hrs · {k.totalVideos} videos
                                </span>
                              </div>
                              <span className="text-slate-500 text-[11px]">
                                {k.logs.length} {lang === 'id' ? 'entri log tercatat pada rentang ini' : 'records logged in this range'}
                              </span>
                            </div>

                            {/* Logs list for this specific kit */}
                            {k.logs.length === 0 ? (
                              <p className="p-2 text-slate-400 font-mono text-[11px] italic">
                                {t.noShootLogsInPeriod}
                              </p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-[11px] font-mono">
                                  <thead>
                                    <tr className="text-slate-400 border-b border-slate-200 text-[10px] uppercase">
                                      <th className="text-left py-1">SDR</th>
                                      <th className="text-left py-1">{lang === 'id' ? 'Tanggal' : 'Date'}</th>
                                      <th className="text-left py-1">{lang === 'id' ? 'Durasi' : 'Duration'}</th>
                                      <th className="text-left py-1">Video</th>
                                      <th className="text-left py-1">{lang === 'id' ? 'Keterangan' : 'Notes'}</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {k.logs.map(log => (
                                      <tr key={log.id}>
                                        <td className="py-1 font-semibold text-slate-800">{log.sdrName}</td>
                                        <td className="py-1 text-slate-500">{log.date}</td>
                                        <td className="py-1 font-bold text-emerald-700">+{log.hours}h</td>
                                        <td className="py-1 text-slate-600">{log.videos} vid</td>
                                        <td className="py-1 text-slate-500">{log.notes || '—'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ─── Login Component ──────────────────────────────────────────────────────────

function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('crm_lang') as Language) || 'id'
  })
  const t = TRANSLATIONS[lang]

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>('SDR')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL

    if (email === 'admin@crm.com' && password === 'admin123') {
      const adminUser: User = { role: 'Sales Manager', name: 'Admin', email, avatarUrl: '', dedicatedSdrs: [] }
      localStorage.setItem('crm_user', JSON.stringify(adminUser))
      onLogin(adminUser)
      setLoading(false)
      return
    }

    if (!scriptUrl) {
      setError(lang === 'id' ? 'URL Google Apps Script tidak diset' : 'Google Apps Script URL is not configured')
      setLoading(false)
      return
    }

    try {
      const res = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: mode,
          email,
          password,
          name: mode === 'signup' ? name : undefined,
          role: mode === 'signup' ? role : undefined,
        })
      })
      const data = await res.json()
      if (data.success) {
        const authUser: User = {
          name: data.name || (data.user && data.user.name) || name || email,
          email: data.email || (data.user && data.user.email) || email,
          role: (data.role || (data.user && data.user.role) || role) as Role,
          avatarUrl: data.avatarUrl || '',
          dedicatedSdrs: data.dedicatedSdrs || []
        }
        localStorage.setItem('crm_user', JSON.stringify(authUser))
        onLogin(authUser)
      } else {
        setError(data.error || t.authFailed)
      }
    } catch (err: any) {
      setError(err.toString())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 border border-slate-800">
        <div className="flex justify-end mb-2">
          <LanguageToggle lang={lang} onChangeLang={l => { setLang(l); localStorage.setItem('crm_lang', l) }} />
        </div>

        <div className="text-center mb-6">
          <div className="w-24 h-24 rounded-3xl overflow-hidden mx-auto mb-4 flex items-center justify-center">
            <Logo className="w-full h-full object-contain rounded-3xl" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 font-sans">{t.loginTitle}</h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            {mode === 'login' ? t.loginSubWelcome : t.signupSubWelcome}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {mode === 'signup' && (
            <>
              <Field label={t.fullName} required>
                <input className="form-input" value={name} onChange={e => setName(e.target.value)} required />
              </Field>
              <Field label={t.roleAccess} required>
                <select className="form-input" value={role} onChange={e => setRole(e.target.value as Role)}>
                  <option value="SDR">SDR</option>
                  <option value="Coordinator">Coordinator</option>
                  <option value="Field Ops">Field Ops</option>
                  <option value="Sales Manager">Sales Manager</option>
                </select>
              </Field>
            </>
          )}

          <Field label="Email" required>
            <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required placeholder="user@domain.com" />
          </Field>

          <Field label="Password" required>
            <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-xs"
          >
            {loading ? t.processing : (mode === 'login' ? t.loginBtn : t.signupBtn)}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <p>
              {t.noAccountPrompt} <button onClick={() => { setMode('signup'); setError('') }} className="text-slate-900 font-bold hover:underline">{t.signUpNow}</button>
            </p>
          ) : (
            <p>
              {t.haveAccountPrompt} <button onClick={() => { setMode('login'); setError('') }} className="text-slate-900 font-bold hover:underline">{t.signInNow}</button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Application Component ───────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('crm_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('crm_lang') as Language) || 'id'
  })

  const t = TRANSLATIONS[lang]
  const [page, setPage] = useState<Page>('dashboard')
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [usersList, setUsersList] = useState<User[]>([])
  const [editRequests, setEditRequests] = useState<EditRequest[]>([])

  // Raw Shoot Logs & Business Groups
  const [rawShootLogs, setRawShootLogs] = useState<RawShootLogItem[]>([])
  const [businessGroups, setBusinessGroups] = useState<ShootBusinessGroup[]>([])
  const [loadingShootData, setLoadingShootData] = useState(false)
  const [isSyncingShootStatus, setIsSyncingShootStatus] = useState(false)

  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<string>('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modal, setModal] = useState<'add' | 'edit' | 'view' | 'profile' | 'team' | null>(null)
  const [selected, setSelected] = useState<Business | null>(null)

  const handleChangeLanguage = (newLang: Language) => {
    setLang(newLang)
    localStorage.setItem('crm_lang', newLang)
  }

  // ─── JSONP Loader for Google Sheet GViz API (Bypasses all CORS issues in browsers) ───
  const fetchGvizSheetData = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      const cbName = 'gviz_hours_cb_' + Date.now() + '_' + Math.floor(Math.random() * 100000)
      const script = document.createElement('script')
      script.src = `https://docs.google.com/spreadsheets/d/1yoGtSR8XJddepxvLkyE_iF42Vfpf5AaV9y4YNbvLl2k/gviz/tq?sheet=hours&tqx=responseHandler:${cbName}`
      
      let timer: any = null
      const cleanup = () => {
        if (timer) clearTimeout(timer)
        delete (window as any)[cbName]
        if (script.parentNode) script.parentNode.removeChild(script)
      }

      timer = setTimeout(() => {
        cleanup()
        reject(new Error('GViz JSONP timeout'))
      }, 15000)

      ;(window as any)[cbName] = (payload: any) => {
        cleanup()
        resolve(payload)
      }

      script.onerror = (err) => {
        cleanup()
        reject(err)
      }

      document.head.appendChild(script)
    })
  }

  // ─── JSONP Loader for Users Tab in User Spreadsheet ───────────────────────
  const fetchGvizUsersData = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      const cbName = 'gviz_users_cb_' + Date.now() + '_' + Math.floor(Math.random() * 100000)
      const script = document.createElement('script')
      script.src = `https://docs.google.com/spreadsheets/d/1YRSrVZFm3gxTU7ZzCjPWYbMzgHo0EufvMQ9ZQ0XRPM4/gviz/tq?sheet=Users&tqx=responseHandler:${cbName}`
      
      let timer: any = null
      const cleanup = () => {
        if (timer) clearTimeout(timer)
        delete (window as any)[cbName]
        if (script.parentNode) script.parentNode.removeChild(script)
      }

      timer = setTimeout(() => {
        cleanup()
        reject(new Error('GViz Users JSONP timeout'))
      }, 12000)

      ;(window as any)[cbName] = (payload: any) => {
        cleanup()
        resolve(payload)
      }

      script.onerror = (err) => {
        cleanup()
        reject(err)
      }

      document.head.appendChild(script)
    })
  }

  const fetchUsersList = async () => {
    try {
      const gvizData = await fetchGvizUsersData()
      if (gvizData && gvizData.table && Array.isArray(gvizData.table.rows)) {
        const rows = gvizData.table.rows
        const list: User[] = []
        
        let localDedMap: Record<string, string[]> = {}
        try {
          localDedMap = JSON.parse(localStorage.getItem('crm_dedicated_sdrs_map') || '{}')
        } catch (e) {}

        let localRoleMap: Record<string, Role> = {}
        try {
          localRoleMap = JSON.parse(localStorage.getItem('crm_user_roles_map') || '{}')
        } catch (e) {}

        for (let i = 0; i < rows.length; i++) {
          const r = rows[i]
          if (!r || !r.c) continue
          const name = (r.c[0]?.v || '').toString().trim()
          const email = (r.c[1]?.v || '').toString().trim()
          const role = (r.c[3]?.v || 'SDR').toString().trim() as Role
          const avatarUrl = (r.c[4]?.v || '').toString().trim()
          const rawDed = r.c[5]?.v
          let dedicatedSdrs: string[] = []
          if (rawDed) {
            try {
              dedicatedSdrs = typeof rawDed === 'string' && rawDed.startsWith('[')
                ? JSON.parse(rawDed)
                : rawDed.toString().split(',').map((s: string) => s.trim()).filter(Boolean)
            } catch (e) {
              dedicatedSdrs = []
            }
          }

          if (name.toLowerCase() === 'username' || email.toLowerCase() === 'email') continue
          if (!email && !name) continue

          const tEmail = email.toLowerCase().trim()
          const finalDedicated = localDedMap[tEmail] !== undefined ? localDedMap[tEmail] : dedicatedSdrs
          const finalRole = localRoleMap[tEmail] || ((role === 'Sales Manager' || role === 'Coordinator' || role === 'Field Ops' || role === 'SDR') ? role : 'SDR')

          list.push({
            name: name || email,
            email,
            role: finalRole,
            avatarUrl,
            dedicatedSdrs: finalDedicated
          })
        }
        if (list.length > 0) {
          setUsersList(list)
          if (user && user.email) {
            const activeEmail = user.email.trim().toLowerCase()
            const foundMe = list.find(u => u.email && u.email.trim().toLowerCase() === activeEmail)
            if (foundMe) {
              const hasRoleChanged = user.role !== foundMe.role
              const hasDedChanged = JSON.stringify(user.dedicatedSdrs || []) !== JSON.stringify(foundMe.dedicatedSdrs || [])
              const hasNameChanged = user.name !== foundMe.name
              const hasAvatarChanged = (user.avatarUrl || '') !== (foundMe.avatarUrl || '')

              if (hasRoleChanged || hasDedChanged || hasNameChanged || hasAvatarChanged) {
                const updatedUser: User = {
                  ...user,
                  name: foundMe.name || user.name,
                  role: foundMe.role || user.role,
                  avatarUrl: foundMe.avatarUrl !== undefined ? foundMe.avatarUrl : user.avatarUrl,
                  dedicatedSdrs: foundMe.dedicatedSdrs || []
                }
                setUser(updatedUser)
                localStorage.setItem('crm_user', JSON.stringify(updatedUser))
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn("Could not fetch Users via GViz JSONP:", e)
    }
  }

  // ─── Fetch Shoot Report (Categorized by Business from Sheet Hours) ──────────
  const fetchAtlasShootData = async (currentBusinesses?: Business[]) => {
    setLoadingShootData(true)
    try {
      const activeBizList = currentBusinesses && currentBusinesses.length > 0 ? currentBusinesses : businesses
      const crmMap = new Map<string, Business>()
      activeBizList.forEach(b => {
        if (b.businessName) {
          crmMap.set(b.businessName.trim().toLowerCase(), b)
        }
      })

      const logsCollected: RawShootLogItem[] = []
      const bizGroupsMap = new Map<string, ShootBusinessGroup>()

      // Pre-populate groups with registered CRM businesses
      activeBizList.forEach(b => {
        const bKey = b.businessName.trim().toLowerCase()
        if (!bizGroupsMap.has(bKey)) {
          bizGroupsMap.set(bKey, {
            businessName: b.businessName,
            crmSdr: b.sdrName,
            city: b.city,
            targetHours: b.hours || 0,
            crmStatus: b.status,
            totalHours: 0,
            totalVideos: 0,
            kitsCount: 0,
            kits: [],
            lastReportDate: '',
            lastReportParsedDate: null,
            hasRecentReport: false,
            shootStatus: 'Stopped',
            utilPercent: 0
          })
        }
      })

      let rowsParsed = false

      // 1. Try Google Visualization JSONP first (bypasses all browser CORS restrictions)
      try {
        const gvizData = await fetchGvizSheetData()
        if (gvizData && gvizData.table && Array.isArray(gvizData.table.rows) && gvizData.table.rows.length > 0) {
          const gRows = gvizData.table.rows
          for (let i = 0; i < gRows.length; i++) {
            const r = gRows[i]
            if (!r || !r.c) continue
            const c = r.c
            const sdr = (c[0]?.v || '').toString().trim()
            const bizName = (c[1]?.v || '').toString().trim()
            const inputDate = (c[2]?.f || c[2]?.v || '').toString().trim()
            const kitCode = (c[3]?.v || '').toString().trim()
            const deviceDate = (c[4]?.f || c[4]?.v || '').toString().trim()
            const videos = typeof c[5]?.v === 'number' ? c[5].v : parseInt(c[5]?.v || '0', 10) || 0
            const hours = typeof c[6]?.v === 'number' ? c[6].v : parseFloat(c[6]?.v || '0') || 0

            if (!bizName || !kitCode) continue

            const effectiveDateStr = deviceDate || inputDate
            const parsedD = parseAnyDate(effectiveDateStr)

            const logItem: RawShootLogItem = {
              id: `JSONP-ROW-${i}`,
              businessName: bizName,
              kitCode,
              sdrName: sdr,
              date: effectiveDateStr,
              parsedDate: parsedD,
              hours: Math.round(hours * 100) / 100,
              videos,
              notes: `Input Date: ${inputDate} · ${videos} video(s)`
            }
            logsCollected.push(logItem)

            const bKey = bizName.trim().toLowerCase()
            if (!bizGroupsMap.has(bKey)) {
              const matchedCrm = crmMap.get(bKey)
              bizGroupsMap.set(bKey, {
                businessName: matchedCrm ? matchedCrm.businessName : bizName,
                crmSdr: matchedCrm ? matchedCrm.sdrName : sdr,
                city: matchedCrm ? matchedCrm.city : '',
                targetHours: matchedCrm ? matchedCrm.hours : 0,
                crmStatus: matchedCrm ? matchedCrm.status : 'Stopped',
                totalHours: 0,
                totalVideos: 0,
                kitsCount: 0,
                kits: [],
                lastReportDate: '',
                lastReportParsedDate: null,
                hasRecentReport: false,
                shootStatus: 'Stopped',
                utilPercent: 0
              })
            }

            const bGroup = bizGroupsMap.get(bKey)!
            bGroup.totalHours = Math.round((bGroup.totalHours + hours) * 100) / 100
            bGroup.totalVideos += videos

            if (parsedD) {
              if (!bGroup.lastReportParsedDate || parsedD > bGroup.lastReportParsedDate) {
                bGroup.lastReportParsedDate = parsedD
                bGroup.lastReportDate = effectiveDateStr
              }
            }

            let kitItem = bGroup.kits.find(k => k.kitCode.toLowerCase() === kitCode.toLowerCase())
            if (!kitItem) {
              kitItem = {
                kitCode,
                totalHours: 0,
                totalVideos: 0,
                targetHours: bGroup.targetHours,
                utilPercent: 0,
                isMaximal: false,
                lastDate: effectiveDateStr,
                lastParsedDate: parsedD,
                logs: []
              }
              bGroup.kits.push(kitItem)
            }

            kitItem.totalHours = Math.round((kitItem.totalHours + hours) * 100) / 100
            kitItem.totalVideos += videos
            kitItem.logs.push(logItem)
            if (parsedD && (!kitItem.lastParsedDate || parsedD > kitItem.lastParsedDate)) {
              kitItem.lastParsedDate = parsedD
              kitItem.lastDate = effectiveDateStr
            }
          }
          rowsParsed = logsCollected.length > 0
        }
      } catch (jsonpErr) {
        console.warn('JSONP loader failed, falling back to CSV fetch:', jsonpErr)
      }

      // 2. Fallback to CSV endpoints if JSONP didn't produce rows
      if (!rowsParsed) {
        const csvUrls = [
          '/api/shoot-hours',
          'https://docs.google.com/spreadsheets/d/1yoGtSR8XJddepxvLkyE_iF42Vfpf5AaV9y4YNbvLl2k/gviz/tq?tqx=out:csv&sheet=hours',
          'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://docs.google.com/spreadsheets/d/1yoGtSR8XJddepxvLkyE_iF42Vfpf5AaV9y4YNbvLl2k/gviz/tq?tqx=out:csv&sheet=hours'),
          'https://corsproxy.io/?url=' + encodeURIComponent('https://docs.google.com/spreadsheets/d/1yoGtSR8XJddepxvLkyE_iF42Vfpf5AaV9y4YNbvLl2k/gviz/tq?tqx=out:csv&sheet=hours')
        ]

        let csvText = ''
        for (const url of csvUrls) {
          try {
            const res = await fetch(url)
            if (res.ok) {
              const txt = await res.text()
              if (txt && txt.length > 100) {
                csvText = txt
                break
              }
            }
          } catch (err) {
            console.warn(`Failed fetching shoot report from ${url}:`, err)
          }
        }

        if (csvText) {
          const parsed = Papa.parse(csvText, { header: false })
          for (let i = 1; i < parsed.data.length; i++) {
            const row: any = parsed.data[i]
            if (!row || row.length < 7) continue
            const sdr = (row[0] || '').toString().trim()
            const bizName = (row[1] || '').toString().trim()
            const inputDate = (row[2] || '').toString().trim()
            const kitCode = (row[3] || '').toString().trim()
            const deviceDate = (row[4] || '').toString().trim()
            const rawVid = (row[5] || '0').toString().replace(/[^0-9]/g, '')
            const videos = parseInt(rawVid, 10) || 0
            const hoursStr = (row[6] || '').toString().replace(',', '.').replace(/[^0-9.]/g, '')
            const hours = parseFloat(hoursStr) || 0

            if (!bizName || !kitCode) continue

            const effectiveDateStr = deviceDate || inputDate
            const parsedD = parseAnyDate(effectiveDateStr)

            const logItem: RawShootLogItem = {
              id: `CSV-ROW-${i}`,
              businessName: bizName,
              kitCode,
              sdrName: sdr,
              date: effectiveDateStr,
              parsedDate: parsedD,
              hours: Math.round(hours * 100) / 100,
              videos,
              notes: `Input Date: ${inputDate} · ${videos} video(s)`
            }
            logsCollected.push(logItem)

            const bKey = bizName.trim().toLowerCase()
            if (!bizGroupsMap.has(bKey)) {
              const matchedCrm = crmMap.get(bKey)
              bizGroupsMap.set(bKey, {
                businessName: matchedCrm ? matchedCrm.businessName : bizName,
                crmSdr: matchedCrm ? matchedCrm.sdrName : sdr,
                city: matchedCrm ? matchedCrm.city : '',
                targetHours: matchedCrm ? matchedCrm.hours : 0,
                crmStatus: matchedCrm ? matchedCrm.status : 'Stopped',
                totalHours: 0,
                totalVideos: 0,
                kitsCount: 0,
                kits: [],
                lastReportDate: '',
                lastReportParsedDate: null,
                hasRecentReport: false,
                shootStatus: 'Stopped',
                utilPercent: 0
              })
            }

            const bGroup = bizGroupsMap.get(bKey)!
            bGroup.totalHours = Math.round((bGroup.totalHours + hours) * 100) / 100
            bGroup.totalVideos += videos

            if (parsedD) {
              if (!bGroup.lastReportParsedDate || parsedD > bGroup.lastReportParsedDate) {
                bGroup.lastReportParsedDate = parsedD
                bGroup.lastReportDate = effectiveDateStr
              }
            }

            let kitItem = bGroup.kits.find(k => k.kitCode.toLowerCase() === kitCode.toLowerCase())
            if (!kitItem) {
              kitItem = {
                kitCode,
                totalHours: 0,
                totalVideos: 0,
                targetHours: bGroup.targetHours,
                utilPercent: 0,
                isMaximal: false,
                lastDate: effectiveDateStr,
                lastParsedDate: parsedD,
                logs: []
              }
              bGroup.kits.push(kitItem)
            }

            kitItem.totalHours = Math.round((kitItem.totalHours + hours) * 100) / 100
            kitItem.totalVideos += videos
            kitItem.logs.push(logItem)
            if (parsedD && (!kitItem.lastParsedDate || parsedD > kitItem.lastParsedDate)) {
              kitItem.lastParsedDate = parsedD
              kitItem.lastDate = effectiveDateStr
            }
          }
        }
      }

      // Calculate final business groups status & metrics
      const finalGroups = Array.from(bizGroupsMap.values()).map(bg => {
        bg.kitsCount = bg.kits.length
        bg.kits.forEach(k => {
          k.utilPercent = k.targetHours > 0 ? Math.min(100, Math.round((k.totalHours / k.targetHours) * 100)) : 0
          k.isMaximal = (k.targetHours > 0 && k.totalHours >= k.targetHours * 0.9) || (k.totalHours > 0 && k.targetHours === 0)
        })

        const utilPercent = bg.targetHours > 0 ? Math.min(100, Math.round((bg.totalHours / bg.targetHours) * 100)) : 0
        let shootStatus: 'Maksimal' | 'Sedang Berjalan' | 'Stopped' = 'Stopped'
        
        if (bg.totalHours > 0) {
          if (bg.targetHours > 0 && bg.totalHours >= bg.targetHours * 0.9) {
            shootStatus = 'Maksimal'
          } else {
            shootStatus = 'Sedang Berjalan'
          }
        }

        return {
          ...bg,
          utilPercent,
          shootStatus,
          hasRecentReport: bg.totalHours > 0
        }
      })

      // Sort with active reports first, then alphabetical
      finalGroups.sort((a, b) => {
        if (a.totalHours > 0 && b.totalHours === 0) return -1
        if (a.totalHours === 0 && b.totalHours > 0) return 1
        return a.businessName.localeCompare(b.businessName)
      })

      setRawShootLogs(logsCollected)
      setBusinessGroups(finalGroups)

      // Decorate businesses with computed shoot metrics without overriding manual business status
      setBusinesses(prevBiz => prevBiz.map(b => {
        const bKey = (b.businessName || '').trim().toLowerCase()
        const matchedGroup = finalGroups.find(g => g.businessName.trim().toLowerCase() === bKey)

        if (matchedGroup) {
          return {
            ...b,
            shootHours: matchedGroup.totalHours,
            shootVideos: matchedGroup.totalVideos,
            shootKitCodes: matchedGroup.kits.map(k => k.kitCode),
            shootLastDate: matchedGroup.lastReportDate,
            shootIsMaximal: matchedGroup.shootStatus === 'Maksimal',
            shootUtilPercent: matchedGroup.utilPercent,
            shootStatus: matchedGroup.shootStatus
          }
        }
        return b
      }))

    } catch (e) {
      console.error("Error fetching shoot data:", e)
    } finally {
      setLoadingShootData(false)
    }
  }

  // ─── Fetch Sheet Data (Two-way Realtime Sync) ──────────────────────────────
  const fetchSheet = async () => {
    try {
      setIsSyncing(true)
      const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL
      if (!scriptUrl) {
        setIsSyncing(false)
        return
      }

      const response = await fetch(scriptUrl)
      const resData = await response.json()

      let bizList: any[] = []
      if (resData && resData.businesses) {
        bizList = resData.businesses
      } else if (Array.isArray(resData)) {
        bizList = resData
      }

      if (resData && resData.editRequests) {
        setEditRequests(resData.editRequests)
      }

      if (resData && resData.users && Array.isArray(resData.users) && resData.users.length > 0) {
        setUsersList(resData.users)

        // Real-time synchronization: Update active logged-in user if Sales Manager edited their data
        if (user && user.email) {
          const activeEmail = user.email.trim().toLowerCase()
          const foundMe = resData.users.find((u: any) => u.email && u.email.trim().toLowerCase() === activeEmail)
          if (foundMe) {
            const hasRoleChanged = user.role !== foundMe.role
            const hasDedChanged = JSON.stringify(user.dedicatedSdrs || []) !== JSON.stringify(foundMe.dedicatedSdrs || [])
            const hasNameChanged = user.name !== foundMe.name
            const hasAvatarChanged = (user.avatarUrl || '') !== (foundMe.avatarUrl || '')

            if (hasRoleChanged || hasDedChanged || hasNameChanged || hasAvatarChanged) {
              const updatedUser: User = {
                ...user,
                name: foundMe.name || user.name,
                role: (foundMe.role || user.role) as Role,
                avatarUrl: foundMe.avatarUrl !== undefined ? foundMe.avatarUrl : user.avatarUrl,
                dedicatedSdrs: foundMe.dedicatedSdrs || []
              }
              setUser(updatedUser)
              localStorage.setItem('crm_user', JSON.stringify(updatedUser))
            }
          }
        }
      } else {
        fetchUsersList()
      }

      const pendingBizNames = new Set(
        (resData.editRequests || [])
          .filter((r: any) => r.status === 'pending')
          .map((r: any) => r.businessName)
      )

      const fetchedBusinesses: Business[] = bizList.map((row: any, index: number) => {
        const bName = (row['Business'] || '').toString().trim()
        const rawStatus = (row['Status'] || '').toString().trim().toLowerCase()

        let normalizedStatus: Status = 'Running'
        if (rawStatus === 'stopped' || rawStatus === 'reject' || rawStatus === 'stop') normalizedStatus = 'Stopped'
        else if (rawStatus === 'approved' || rawStatus === 'approve') normalizedStatus = 'approved'
        else if (rawStatus === 'pending') normalizedStatus = 'pending'
        else if (rawStatus === 'canceled' || rawStatus === 'cancelled' || rawStatus === 'cancel') normalizedStatus = 'canceled'
        else if (rawStatus === 'fraud') normalizedStatus = 'Fraud'

        const rawHw = (row['Hardware'] || '').toString().trim()
        const normalizedHw = normalizeHardware(rawHw)
        const sdr = (row['SDR Name'] || '').toString().trim()

        const rawOwnerKtp = (row['Business Owner ID card Number'] || '').toString().trim()
        const rawAuditKtp = (row['ID Card Audit (for Admin)'] || '').toString().trim()
        let ktpPhotoUrl = ''
        let ownerKtp = rawOwnerKtp.replace(/^'/, '')
        if (rawAuditKtp && rawAuditKtp.includes('http')) {
          ktpPhotoUrl = rawAuditKtp
        } else if (rawOwnerKtp.includes('http')) {
          ktpPhotoUrl = rawOwnerKtp
          ownerKtp = ''
        }

        const effectiveStatus = normalizedStatus

        let parsedHours = 0
        const rawHoursStr = (row['Hours'] || '').toString().trim()
        if (rawHoursStr) {
          if (rawHoursStr.includes('/')) {
            const hDate = parseAnyDate(rawHoursStr)
            if (hDate) {
              const epoch = new Date(1899, 11, 30)
              const diff = Math.round((hDate.getTime() - epoch.getTime()) / (24 * 3600 * 1000))
              if (diff > 0 && diff < 10000) {
                parsedHours = diff
              } else {
                parsedHours = parseInt(rawHoursStr, 10) || 0
              }
            } else {
              parsedHours = parseInt(rawHoursStr, 10) || 0
            }
          } else {
            parsedHours = parseInt(rawHoursStr, 10) || 0
          }
        }

        return {
          id: `${bName}___${sdr}___${index}`,
          businessName: bName,
          sdrName: sdr,
          submissionDate: (row['Submission Date'] || '').toString().trim(),
          hours: parsedHours,
          hardware: normalizedHw,
          quantity: parseInt(row['Quantity']) || 0,
          rate: parseFloat((row['Rate ($/hr)'] || '0').replace(/[^0-9.]/g, '')) || 0,
          accountHolderName: (row['Account Holder Name (as at bank)'] || '').toString().trim(),
          bankName: ((row['Bank (pick from list)'] || '').toString().trim() || WISE_BANKS[0]) as BankName,
          accountNumber: (row['Account Number (digits only)'] || '').toString().trim().replace(/^'/, ''),
          accountType: ((row['Acc Type'] || '').toString().trim() || 'PERSON') as AccountType,
          city: (row['City'] || '').toString().trim(),
          fullAddress: (row['Address'] || '').toString().trim(),
          postalCode: (row['Post Code'] || '').toString().trim(),
          phone: normalizePhoneNumber((row['Phone Number'] || '').toString().trim()),
          email: (row['Email'] || '').toString().trim(),
          ownerKtp: ownerKtp,
          proposalLink: (row['Proposal'] || '').toString().trim(),
          mouLink: (row['MoU'] || '').toString().trim(),
          agreementLink: (row['Agreement'] || '').toString().trim(),
          status: effectiveStatus,
          ktpPhotoUrl: ktpPhotoUrl,
          hasPendingEdit: pendingBizNames.has(bName)
        }
      })

      const valid = fetchedBusinesses.filter(b => b.businessName || b.sdrName)
      if (valid.length > 0) {
        setBusinesses(valid)
        fetchAtlasShootData(valid)
      }

      setLastSyncTime(new Date().toLocaleTimeString(lang === 'id' ? 'id-ID' : 'en-US'))
    } catch (e) {
      console.error("Error fetching spreadsheet data:", e)
    } finally {
      setIsSyncing(false)
    }
  }

  // Realtime Polling & Window Focus Auto-Sync
  useEffect(() => {
    fetchSheet()
    fetchAtlasShootData()
    fetchUsersList()

    const interval = setInterval(() => {
      fetchSheet()
      fetchUsersList()
    }, 20000)

    const handleFocus = () => {
      fetchSheet()
      fetchAtlasShootData()
      fetchUsersList()
    }
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchSheet()
        fetchAtlasShootData()
        fetchUsersList()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  // Auto-fetch shoot data & users list whenever navigating to relevant pages
  useEffect(() => {
    if ((page === 'shoot-report' || page === 'sdr' || page === 'dashboard') && businessGroups.length === 0) {
      fetchAtlasShootData(businesses)
    }
    if (page === 'team' || modal === 'team') {
      fetchUsersList()
    }
  }, [page, modal])

  const handleUpdateUser = (updated: Partial<User>) => {
    if (!user) return
    const nextUser = { ...user, ...updated }
    setUser(nextUser)
    localStorage.setItem('crm_user', JSON.stringify(nextUser))
  }

  const handleLogout = () => {
    localStorage.removeItem('crm_user')
    setUser(null)
  }

  // ─── Status Quick Toggle / Auto-Update to Spreadsheet ────────────────────
  const handleQuickToggleStatus = async (business: Business, newStatus: Status) => {
    setBusinesses(prev => prev.map(b => (b.id === business.id || b.businessName === business.businessName) ? { ...b, status: newStatus } : b))

    const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL
    if (scriptUrl) {
      try {
        await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'update_business_status',
            businessName: business.businessName,
            sdrName: business.sdrName,
            status: newStatus
          })
        })
      } catch (err) {
        console.error("Failed to update status in spreadsheet:", err)
      }
    }
  }

  // ─── Bulk Synchronize Business Status from Shoot Report ──────────────────
  const handleSyncStatusFromShootReport = async () => {
    setIsSyncingShootStatus(true)
    try {
      const candidates = businesses.filter(b => (b.shootHours || 0) > 0 && b.status !== 'Running')

      if (candidates.length === 0) {
        alert(t.syncShootNoChanges)
        setIsSyncingShootStatus(false)
        return
      }

      const candidateNames = new Set(candidates.map(c => c.businessName.toLowerCase()))
      setBusinesses(prev => prev.map(b => {
        if (candidateNames.has(b.businessName.toLowerCase())) {
          return { ...b, status: 'Running' }
        }
        return b
      }))

      const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL
      if (scriptUrl) {
        for (const b of candidates) {
          try {
            await fetch(scriptUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({
                action: 'update_business_status',
                businessName: b.businessName,
                sdrName: b.sdrName,
                status: 'Running'
              })
            })
          } catch (e) {
            console.error(`Failed to sync status for ${b.businessName}:`, e)
          }
        }
      }

      alert(t.syncShootSuccess(candidates.length))
    } catch (err) {
      console.error("Sync error:", err)
    } finally {
      setIsSyncingShootStatus(false)
    }
  }

  // ─── Save / Edit Business ─────────────────────────────────────────────────
  const handleSave = async (form: Omit<Business, 'id'> & { id?: string, originalBusinessName?: string, originalSdrName?: string }) => {
    if (!user) return

    const isEdit = Boolean(form.id)
    const isSdr = user.role === 'SDR'

    if (isEdit && isSdr) {
      const isOnlyStatusChange = selected &&
        selected.businessName === form.businessName &&
        selected.submissionDate === form.submissionDate &&
        selected.hours === form.hours &&
        selected.hardware === form.hardware &&
        selected.rate === form.rate &&
        selected.city === form.city &&
        selected.fullAddress === form.fullAddress &&
        selected.phone === form.phone &&
        selected.email === form.email &&
        selected.ownerKtp === form.ownerKtp &&
        selected.bankName === form.bankName &&
        selected.accountNumber === form.accountNumber &&
        selected.accountHolderName === form.accountHolderName

      if (isOnlyStatusChange) {
        setBusinesses(prev => prev.map(b => b.id === form.id ? (form as Business) : b))
        setModal(null)
        const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL
        if (scriptUrl) {
          fetch(scriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'save_business', data: form })
          })
        }
        alert(t.saveSuccess)
        return
      }

      const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL
      if (scriptUrl) {
        try {
          const res = await fetch(scriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              action: 'submit_edit_request',
              requesterName: user.name,
              requesterRole: user.role,
              businessName: form.businessName,
              sdrName: form.sdrName,
              originalData: selected,
              updatedData: form
            })
          })
          const data = await res.json()
          alert(data.message || (lang === 'id' ? 'Permintaan edit berhasil dikirim dan menunggu persetujuan.' : 'Edit request submitted successfully, awaiting review.'))
          fetchSheet()
        } catch (e) {
          console.error(e)
        }
      }
      setModal(null)
      return
    }

    if (isEdit) {
      setBusinesses(prev => prev.map(b => b.id === form.id ? (form as Business) : b))
    } else {
      const newBiz: Business = {
        ...form,
        id: `NEW-${Date.now()}`
      }
      setBusinesses(prev => [newBiz, ...prev])
    }
    setModal(null)

    const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL
    if (scriptUrl) {
      try {
        await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'save_business', data: form })
        })
        fetchSheet()
      } catch (err) {
        console.error(err)
      }
    }
    alert(t.saveSuccess)
  }

  const handleDelete = async (b: Business) => {
    if (!window.confirm(t.deleteConfirm(b.businessName))) return

    setBusinesses(prev => prev.filter(item => item.id !== b.id))

    const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL
    if (scriptUrl) {
      try {
        await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'delete_business',
            data: { businessName: b.businessName, sdrName: b.sdrName, ktpPhotoUrl: b.ktpPhotoUrl }
          })
        })
      } catch (err) {
        console.error("Delete error:", err)
      }
    }
    alert(t.deleteSuccess)
  }

  const handleApproveRequest = async (req: EditRequest) => {
    if (!user) return
    const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL
    if (scriptUrl) {
      try {
        const res = await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'approve_edit_request',
            requestId: req.requestId,
            reviewedBy: user.name
          })
        })
        const data = await res.json()
        alert(data.message || (lang === 'id' ? 'Permintaan berhasil disetujui.' : 'Request approved successfully.'))
        fetchSheet()
      } catch (e) {
        console.error(e)
      }
    }
  }

  const handleRejectRequest = async (req: EditRequest) => {
    if (!user) return
    const reason = prompt(t.rejectReasonPrompt) || 'Rejected'
    const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL
    if (scriptUrl) {
      try {
        const res = await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'reject_edit_request',
            requestId: req.requestId,
            reviewedBy: user.name,
            reason
          })
        })
        const data = await res.json()
        alert(data.message || (lang === 'id' ? 'Permintaan ditolak.' : 'Request rejected.'))
        fetchSheet()
      } catch (e) {
        console.error(e)
      }
    }
  }

  const handleUpdateUserRole = async (targetEmail: string, newRole: Role) => {
    const tEmail = targetEmail.trim().toLowerCase()
    try {
      const curMap = JSON.parse(localStorage.getItem('crm_user_roles_map') || '{}')
      curMap[tEmail] = newRole
      localStorage.setItem('crm_user_roles_map', JSON.stringify(curMap))
    } catch (e) {}

    setUsersList(prev => prev.map(u => u.email.trim().toLowerCase() === tEmail ? { ...u, role: newRole } : u))
    if (user && user.email.trim().toLowerCase() === tEmail) {
      const nextUser = { ...user, role: newRole }
      setUser(nextUser)
      localStorage.setItem('crm_user', JSON.stringify(nextUser))
    }

    const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL
    if (scriptUrl) {
      try {
        const res = await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'update_user_role',
            targetEmail,
            newRole
          })
        })
        const data = await res.json().catch(() => null)
        if (data && data.message) {
          alert(data.message)
        } else {
          alert(lang === 'id' ? `Role pengguna berhasil diubah ke ${newRole}!` : `User role successfully updated to ${newRole}!`)
        }
      } catch (e) {
        console.error(e)
      }
    } else {
      alert(lang === 'id' ? `Role pengguna berhasil diubah ke ${newRole}!` : `User role successfully updated to ${newRole}!`)
    }
  }

  const handleUpdateDedicatedSdrs = async (targetEmail: string, dedicatedSdrs: string[]) => {
    const tEmail = targetEmail.trim().toLowerCase()
    try {
      const curMap = JSON.parse(localStorage.getItem('crm_dedicated_sdrs_map') || '{}')
      curMap[tEmail] = dedicatedSdrs
      localStorage.setItem('crm_dedicated_sdrs_map', JSON.stringify(curMap))
    } catch (e) {}

    setUsersList(prev => prev.map(u => u.email.trim().toLowerCase() === tEmail ? { ...u, dedicatedSdrs } : u))
    if (user && user.email.trim().toLowerCase() === tEmail) {
      const nextUser = { ...user, dedicatedSdrs }
      setUser(nextUser)
      localStorage.setItem('crm_user', JSON.stringify(nextUser))
    }

    const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL
    if (scriptUrl) {
      try {
        const res = await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'update_user_dedicated_sdrs',
            targetEmail,
            dedicatedSdrs
          })
        })
        const data = await res.json().catch(() => null)
        if (data && data.message) {
          alert(data.message)
        } else {
          alert(lang === 'id' ? 'Dedicated SDR berhasil diperbarui!' : 'Dedicated SDRs successfully updated!')
        }
      } catch (e) {
        console.error(e)
      }
    } else {
      alert(lang === 'id' ? 'Dedicated SDR berhasil diperbarui!' : 'Dedicated SDRs successfully updated!')
    }
  }

  if (!user) {
    return <Login onLogin={setUser} />
  }

  const isManagement = user.role === 'Sales Manager' || user.role === 'Coordinator' || user.role === 'Field Ops'
  const isSalesManager = user.role === 'Sales Manager'
  const pendingRequestsCount = editRequests.filter(r => r.status === 'pending').length

  const NAV = [
    { id: 'dashboard' as Page, label: t.navDashboard, icon: <IconDashboard className="w-4 h-4" /> },
    { id: 'businesses' as Page, label: t.navBusinesses, icon: <IconBuilding className="w-4 h-4" /> },
    ...(isManagement ? [{ id: 'sdr' as Page, label: t.navSdr, icon: <IconUsers className="w-4 h-4" /> }] : []),
    { id: 'shoot-report' as Page, label: t.navShootReport, icon: <IconShootReport className="w-4 h-4" /> },
    ...(isManagement ? [{ id: 'approvals' as Page, label: t.navApprovals, icon: <IconApprovals className="w-4 h-4" />, badge: pendingRequestsCount }] : []),
    ...(isSalesManager ? [{ id: 'team' as Page, label: t.navTeamManage, icon: <IconShieldCheck className="w-4 h-4" /> }] : []),
  ]

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 overflow-hidden font-sans">
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-slate-900/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Dark Sidebar */}
      <aside className={`
        fixed lg:relative z-30 lg:z-auto inset-y-0 left-0
        w-64 bg-slate-950 border-r border-slate-800 flex flex-col text-slate-300
        transition-transform duration-200 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        shadow-xl lg:shadow-none
      `}>
        <div className="px-5 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center shrink-0">
              <Logo className="w-full h-full object-contain rounded-2xl" />
            </div>
            <div>
              <p className="text-base font-bold text-white font-sans tracking-wide leading-tight">{t.portalName}</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{t.portalSub}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(item => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              badge={item.badge}
              active={page === item.id}
              onClick={() => { setPage(item.id); setSidebarOpen(false) }}
            />
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">{t.langSelect}</span>
          <LanguageToggle lang={lang} onChangeLang={handleChangeLanguage} />
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setModal('profile')}
              className="flex items-center gap-3 min-w-0 text-left group hover:opacity-90 transition-opacity"
              title={t.settings}
            >
              <UserAvatar user={user} size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate group-hover:text-slate-300">{user.name}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate uppercase font-medium tracking-wider">{user.role}</p>
              </div>
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setModal('profile')}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title={t.settings}
              >
                <IconSettings className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                title={t.logout}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 text-lg">☰</button>
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">CRM Tangerang</span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-bold text-slate-900 capitalize font-sans">{page.replace('-', ' ')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Sync Status Indicator */}
            <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-mono text-slate-700">
              <span>Live Sync {lastSyncTime && `(${lastSyncTime})`}</span>
              <button
                onClick={fetchSheet}
                title="Refresh data dari Spreadsheet"
                className="hover:text-slate-950 transition-colors ml-0.5"
              >
                <IconRefresh className="w-3.5 h-3.5" spinning={isSyncing} />
              </button>
            </div>

            {isSalesManager && (
              <button
                onClick={() => setModal('team')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
              >
                <IconShieldCheck className="w-3.5 h-3.5" />
                {t.navTeamManage}
              </button>
            )}

            <LanguageToggle lang={lang} onChangeLang={handleChangeLanguage} />

            <button
              onClick={() => setModal('profile')}
              className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
            >
              <UserAvatar user={user} size="xs" />
              <span className="text-xs font-semibold text-slate-800 hidden sm:inline">{user.name}</span>
            </button>
          </div>
        </div>

        {/* Main Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {page === 'dashboard' && <Dashboard businesses={businesses} rawShootLogs={rawShootLogs} user={user} lang={lang} />}
          {page === 'businesses' && (
            <AllBusinesses
              businesses={businesses}
              user={user}
              lang={lang}
              onAdd={() => { setSelected(null); setModal('add') }}
              onEdit={(b) => { setSelected(b); setModal('edit') }}
              onDelete={handleDelete}
              onView={(b) => { setSelected(b); setModal('view') }}
              onQuickToggleStatus={handleQuickToggleStatus}
              onSyncShootStatus={handleSyncStatusFromShootReport}
              isSyncingShootStatus={isSyncingShootStatus}
            />
          )}
          {page === 'sdr' && <SDRDirectory businesses={businesses} user={user} rawShootLogs={rawShootLogs} lang={lang} />}
          {page === 'shoot-report' && (
            <ShootReport
              businessGroups={businessGroups}
              businesses={businesses}
              user={user}
              lang={lang}
              loadingShootData={loadingShootData}
              onRefreshShootData={() => fetchAtlasShootData(businesses)}
            />
          )}
          {page === 'approvals' && isManagement && (
            <ApprovalRequests
              requests={editRequests}
              user={user}
              lang={lang}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
            />
          )}
          {page === 'team' && isSalesManager && (
            <TeamManagementView
              currentUser={user}
              users={usersList.length > 0 ? usersList : [user]}
              lang={lang}
              onUpdateUserRole={handleUpdateUserRole}
              onUpdateDedicatedSdrs={handleUpdateDedicatedSdrs}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      {(modal === 'add' || modal === 'edit') && (
        <BusinessModal
          initial={
            modal === 'edit' && selected
              ? selected
              : {
                  ...BLANK_FORM,
                  sdrName: user.role === 'SDR'
                    ? (SDR_LIST.find(s => s.toLowerCase() === user.name.toLowerCase()) || user.name || SDR_LIST[0])
                    : (user.role === 'Field Ops' && user.dedicatedSdrs && user.dedicatedSdrs.length > 0
                        ? user.dedicatedSdrs[0]
                        : BLANK_FORM.sdrName)
                }
          }
          existingBusinesses={businesses}
          user={user}
          lang={lang}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'view' && selected && (
        <DetailModal b={selected} lang={lang} onClose={() => setModal(null)} />
      )}

      {modal === 'profile' && (
        <ProfileModal
          user={user}
          lang={lang}
          onChangeLang={handleChangeLanguage}
          onUpdateUser={handleUpdateUser}
          onOpenTeamManage={() => setModal('team')}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'team' && isSalesManager && (
        <TeamManageModal
          currentUser={user}
          users={usersList.length > 0 ? usersList : [user]}
          lang={lang}
          onUpdateUserRole={handleUpdateUserRole}
          onUpdateDedicatedSdrs={handleUpdateDedicatedSdrs}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
