(function () {
  'use strict';

  const WHATSAPP_NUMBER = '966566123883';

  const form = document.getElementById('orderForm');
  const serviceSelect = document.getElementById('serviceSelect');
  const formNote = document.getElementById('formNote');
  const yearEl = document.getElementById('year');
  const conditionals = Array.prototype.slice.call(
    document.querySelectorAll('.conditional')
  );

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ظهور الأقسام عند التمرير
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // إظهار كتلة النوع المختار وإخفاء الباقي.
  // الحقول المخفية تُعطّل (disabled) حتى تُستثنى من التحقق ومن FormData؛
  // الحقول المطلوبة معرّفة بـ required في الـ HTML ويتم تجاهلها تلقائياً وهي معطّلة.
  function toggleConditional(type) {
    conditionals.forEach(function (block) {
      const isMatch = block.getAttribute('data-for') === type;
      block.classList.toggle('show', isMatch);
      block.querySelectorAll('input, textarea, select').forEach(function (f) {
        f.disabled = !isMatch;
      });
    });
  }

  function activeBlock() {
    return conditionals.filter(function (b) {
      return b.classList.contains('show');
    })[0];
  }

  // ربط أسماء الباقات القصيرة في الرابط بقيم القائمة
  const SERVICE_SLUGS = {
    programmed: 'بطاقة مبرمجة',
    print: 'اطبع تصميمك',
    design: 'صمّم واطبع',
  };

  const SERVICE_PRICES = {
    'بطاقة مبرمجة': '60 ر.س',
    'اطبع تصميمك': '100 ر.س',
    'صمّم واطبع': '180 ر.س',
  };

  if (serviceSelect) {
    serviceSelect.addEventListener('change', function () {
      toggleConditional(serviceSelect.value);
    });

    // الباقة المختارة من الصفحة الرئيسية تصل عبر ?service=slug
    const slug = new URLSearchParams(location.search).get('service');
    if (slug && SERVICE_SLUGS[slug]) {
      serviceSelect.value = SERVICE_SLUGS[slug];
    }

    toggleConditional(serviceSelect.value); // الحالة الابتدائية
  }

  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const service = (serviceSelect && serviceSelect.value) || '';
    const get = function (name) {
      const el = form.elements[name];
      return el ? (el.value || '').toString().trim() : '';
    };

    const lines = [
      'السلام عليكم، أبغى أطلب بطاقة NFC:',
      '',
      '• نوع الخدمة: ' + service,
      '• السعر: ' + (SERVICE_PRICES[service] || ''),
    ];

    // حقول النوع المختار (تُبنى تلقائياً من data-label)
    const block = activeBlock();
    if (block) {
      block.querySelectorAll('input, textarea, select').forEach(function (f) {
        const label = f.getAttribute('data-label') || f.name;
        if (f.type === 'file') {
          if (f.files && f.files.length) {
            lines.push('• 📎 سأرفق ' + label + ' في هذه المحادثة.');
          }
          return;
        }
        const val = (f.value || '').toString().trim();
        if (val) lines.push('• ' + label + ': ' + val);
      });
    }

    // الحقول المشتركة
    lines.push('• الاسم: ' + get('name'));
    lines.push('• الجوال: ' + get('phone'));
    lines.push('• الكمية: ' + get('quantity'));
    const notes = get('notes');
    if (notes) lines.push('• ملاحظات: ' + notes);

    const message = lines.join('\n');
    const url =
      'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);

    if (formNote) {
      // تذكير إرفاق الملف يهمّ نوع "اطبع تصميمك" تحديداً
      formNote.hidden = service !== 'اطبع تصميمك';
    }

    window.open(url, '_blank', 'noopener');
  });
})();
