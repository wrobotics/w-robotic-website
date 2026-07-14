const form = document.querySelector('[data-registration-form]');
const status = document.querySelector('[data-form-status]');
const interestError = document.querySelector('[data-interest-error]');
const submitButton = form?.querySelector('button[type="submit"]');
const registrationEndpoint = 'https://script.google.com/macros/s/AKfycbyNcoaDMqLHn5jB2JkYDkyiuW4QLwQNuhgilzr3L7gw4YG1SolmXxnIwXEGI8Q7U5E/exec';
const eventNames = {
  'national-robocup-2026': ['RoboCup National Rotorua', 'RoboCup 全国赛'],
  'vex-iq-competition-2026': ['VEX IQ Competition', 'VEX IQ 区赛'],
  'vex-iq-scrimmage-2026': ['VEX IQ Scrimmage', 'VEX IQ 惠灵顿友谊赛'],
};
const eventId = new URLSearchParams(window.location.search).get('event');
const selectedEvent = document.querySelector('[data-selected-event]');
const notesField = form?.querySelector('textarea[name="notes"]');
if (eventId && eventNames[eventId]) {
  const isChinese = document.documentElement.lang === 'zh-CN';
  const eventName = eventNames[eventId][isChinese ? 1 : 0];
  selectedEvent.hidden = false;
  selectedEvent.textContent = `${isChinese ? '报名活动' : 'Selected event'}: ${eventName}`;
  notesField.value = `[Event: ${eventId} — ${eventName}]\n`;
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const interests = form.querySelectorAll('input[name="interest"]:checked');
  interestError?.classList.toggle('visible', interests.length === 0);

  if (!form.checkValidity() || interests.length === 0) {
    form.classList.add('was-validated');
    status.textContent = document.documentElement.lang === 'zh-CN'
      ? '请检查并完成标出的必填项目。'
      : 'Please check and complete the required fields.';
    status.className = 'form-status error';
    form.querySelector(':invalid')?.focus();
    return;
  }

  const formData = new FormData(form);
  const requestBody = new URLSearchParams();
  formData.forEach((value, key) => requestBody.append(key, value));
  requestBody.set('interest', formData.getAll('interest').join('; '));

  submitButton.disabled = true;
  submitButton.textContent = document.documentElement.lang === 'zh-CN' ? '正在提交…' : 'Submitting…';
  status.className = 'form-status';

  try {
    await fetch(registrationEndpoint, {
      method: 'POST',
      mode: 'no-cors',
      body: requestBody,
    });
    status.textContent = document.documentElement.lang === 'zh-CN'
      ? '提交成功！WRC 已收到您的报名意向，我们会尽快与您联系。'
      : 'Thank you! WRC has received your registration and will be in touch soon.';
    status.className = 'form-status success';
    form.reset();
    form.classList.remove('was-validated');
  } catch (error) {
    status.textContent = document.documentElement.lang === 'zh-CN'
      ? '暂时无法提交，请稍后重试或发送邮件至 info@w-robotic.com。'
      : 'Unable to submit right now. Please try again or email info@w-robotic.com.';
    status.className = 'form-status error';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = document.documentElement.lang === 'zh-CN' ? '提交报名意向' : 'Submit interest';
  }
});
