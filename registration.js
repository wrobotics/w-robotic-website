const form = document.querySelector('[data-registration-form]');
const status = document.querySelector('[data-form-status]');
const interestError = document.querySelector('[data-interest-error]');
const submissionPreview = document.querySelector('[data-submission-preview]');
const previewFields = document.querySelector('[data-preview-fields]');

const labels = document.documentElement.lang === 'zh-CN'
  ? {
      studentName: '学生名字', studentAge: '年龄', guardianName: '家长／监护人', email: '邮箱',
      experience: '经验', interest: '兴趣方向', preferredTime: '方便时间', language: '沟通语言',
      phone: '电话', suburb: '居住区域', status: '跟进状态', submitted: '提交时间',
    }
  : {
      studentName: 'Student', studentAge: 'Age group', guardianName: 'Parent/guardian', email: 'Email',
      experience: 'Experience', interest: 'Interests', preferredTime: 'Preferred time', language: 'Language',
      phone: 'Phone', suburb: 'Suburb', status: 'Status', submitted: 'Submitted',
    };

const showSheetRowPreview = (formData) => {
  if (!submissionPreview || !previewFields) return;
  const fields = [
    ['submitted', new Date().toLocaleString()],
    ['studentName', formData.get('studentName')],
    ['studentAge', formData.get('studentAge')],
    ['guardianName', formData.get('guardianName')],
    ['email', formData.get('email')],
    ['experience', formData.get('experience')],
    ['interest', formData.getAll('interest').join('; ')],
    ['preferredTime', formData.get('preferredTime') || '—'],
    ['language', formData.get('language')],
    ['phone', formData.get('phone') || '—'],
    ['suburb', formData.get('suburb') || '—'],
    ['status', document.documentElement.lang === 'zh-CN' ? '新报名' : 'New enquiry'],
  ];
  previewFields.replaceChildren(...fields.map(([key, value]) => {
    const wrapper = document.createElement('div');
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = labels[key];
    description.textContent = value;
    wrapper.append(term, description);
    return wrapper;
  }));
  submissionPreview.hidden = false;
  submissionPreview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

form?.addEventListener('submit', (event) => {
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

  status.textContent = document.documentElement.lang === 'zh-CN'
    ? '测试提交成功！下方显示了这条资料写入 Google Sheet 后的样子。'
    : 'Test submission successful! The Google Sheet row preview is shown below.';
  status.className = 'form-status success';
  showSheetRowPreview(new FormData(form));
});
