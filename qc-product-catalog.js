/* QC Toolbox — shared product catalog schema and validation. */
(function (global) {
  'use strict';

  const legacy = [
    ['milk-fat-200', 'شیر پرچرب', 200, 'D', 'شیر پرچرب ۲۰۰'],
    ['milk-lowfat-200', 'شیر کم‌چرب', 200, 'E', 'شیر کم‌چرب ۲۰۰'],
    ['milk-banana-200', 'شیر موز', 200, 'J', 'شیر موز ۲۰۰'],
    ['milk-cocoa-200', 'شیر کاکائو', 200, 'F', 'شیر کاکائو ۲۰۰'],
    ['milk-coffee-200', 'شیر قهوه', 200, 'G', 'شیر قهوه ۲۰۰'],
    ['milk-coconut-200', 'شیر نارگیل', 200, 'I', 'شیر نارگیل ۲۰۰'],
    ['milk-fat-1000', 'شیر پرچرب', 1000, 'D', 'شیر پرچرب ۱۰۰۰'],
    ['milk-lowfat-1000', 'شیر کم‌چرب', 1000, 'E', 'شیر کم‌چرب ۱۰۰۰'],
    ['milk-banana-1000', 'شیر موز', 1000, 'J', 'شیر موز ۱۰۰۰'],
    ['milk-cocoa-1000', 'شیر کاکائو', 1000, 'F', 'شیر کاکائو ۱۰۰۰'],
    ['milk-coconut-1000', 'شیر نارگیل', 1000, 'I', 'شیر نارگیل ۱۰۰۰']
  ].map(([id, name, volumeMl, batchLetter, priceKey]) => ({
    id, name, volumeMl, productionType: 'standard', active: true,
    shelfLifeMonths: 6, batchLetter, priceKey
  }));

  const dooghDrafts = [
    { id: 'doogh-200-standard', name: 'دوغ', volumeMl: 200, productionType: 'standard', active: false, shelfLifeMonths: null, batchLetter: null, priceKey: 'doogh-200-standard' },
    { id: 'doogh-275-standard', name: 'دوغ', volumeMl: 275, productionType: 'standard', active: false, shelfLifeMonths: null, batchLetter: null, priceKey: 'doogh-275-standard' },
    { id: 'doogh-200-restaurant', name: 'دوغ ویژه رستوران', volumeMl: 200, productionType: 'restaurant', active: false, shelfLifeMonths: null, batchLetter: null, priceKey: 'doogh-200-restaurant' },
    { id: 'doogh-275-restaurant', name: 'دوغ ویژه رستوران', volumeMl: 275, productionType: 'restaurant', active: false, shelfLifeMonths: null, batchLetter: null, priceKey: 'doogh-275-restaurant' }
  ];

  const DEFAULT_PRODUCTS = legacy.concat(dooghDrafts);
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';

  function toPersianDigits(value) {
    return String(value).replace(/[0-9]/g, digit => persianDigits[Number(digit)]);
  }

  function isValidShelfLife(value) {
    return Number.isInteger(value) && value >= 1 && value <= 36;
  }

  function normalizeProduct(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const id = typeof raw.id === 'string' ? raw.id.trim() : '';
    const name = typeof raw.name === 'string' ? raw.name.trim().replace(/[<>]/g, '') : '';
    const volumeMl = Number(raw.volumeMl);
    const productionType = raw.productionType === 'restaurant' ? 'restaurant' : 'standard';
    if (!/^[a-zA-Z0-9_-]{3,90}$/.test(id) || ['__proto__','prototype','constructor'].includes(id) || !name || name.length > 50 || !Number.isInteger(volumeMl) || volumeMl < 50 || volumeMl > 5000) return null;

    const shelfValue = raw.shelfLifeMonths;
    const shelfLifeMonths = isValidShelfLife(shelfValue) ? shelfValue : null;
    const letterRaw = typeof raw.batchLetter === 'string' ? raw.batchLetter.trim().toUpperCase() : '';
    const batchLetter = /^[A-Z]$/.test(letterRaw) ? letterRaw : null;
    const active = raw.active === true && shelfLifeMonths !== null && batchLetter !== null;
    const priceKeyRaw = typeof raw.priceKey === 'string' ? raw.priceKey.trim() : '';
    const priceKey = priceKeyRaw && priceKeyRaw.length <= 100 && !['__proto__','prototype','constructor'].includes(priceKeyRaw) ? priceKeyRaw : id;

    return {
      id,
      name,
      volumeMl,
      productionType,
      active,
      shelfLifeMonths,
      batchLetter,
      priceKey,
      pricingEnabled: productionType === 'standard',
      printTarget: productionType === 'restaurant' ? 'sleeve' : 'standard',
      displayName: name + ' ' + toPersianDigits(volumeMl)
    };
  }

  function normalizeCatalog(raw) {
    const products = new Map();
    DEFAULT_PRODUCTS.forEach(item => {
      const normalized = normalizeProduct(item);
      if (normalized) products.set(normalized.id, normalized);
    });
    const incoming = Array.isArray(raw) ? raw : (raw && Array.isArray(raw.products) ? raw.products : []);
    incoming.forEach(item => {
      const normalized = normalizeProduct(item);
      if (normalized) products.set(normalized.id, normalized);
    });
    return Array.from(products.values());
  }

  function canUse(product) {
    return !!product && product.active === true && isValidShelfLife(product.shelfLifeMonths) && /^[A-Z]$/.test(product.batchLetter || '');
  }

  function statusText(product) {
    if (!product) return 'نامعتبر';
    if (!isValidShelfLife(product.shelfLifeMonths)) return 'پیش‌نویس: ماندگاری تعیین نشده';
    if (!product.batchLetter) return 'پیش‌نویس: حرف کد بچ ثبت نشده';
    if (!product.active) return 'غیرفعال';
    return 'فعال';
  }

  function createId() {
    if (global.crypto && typeof global.crypto.randomUUID === 'function') return 'product-' + global.crypto.randomUUID();
    return 'product-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
  }

  function serialize(products) {
    return {
      schemaVersion: 1,
      products: (Array.isArray(products) ? products : []).map(product => ({
        id: product.id,
        name: product.name,
        volumeMl: product.volumeMl,
        productionType: product.productionType,
        active: product.active === true,
        shelfLifeMonths: isValidShelfLife(product.shelfLifeMonths) ? product.shelfLifeMonths : null,
        batchLetter: /^[A-Z]$/.test(product.batchLetter || '') ? product.batchLetter : null,
        priceKey: product.priceKey || product.id
      }))
    };
  }

  global.QCProductCatalog = Object.freeze({
    DEFAULT_PRODUCTS,
    normalizeProduct,
    normalizeCatalog,
    canUse,
    statusText,
    isValidShelfLife,
    toPersianDigits,
    createId,
    serialize
  });
})(window);
