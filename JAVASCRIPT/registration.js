// 새신자 등록 관련 로직

class Registration {
  constructor() {
    this.form = document.getElementById("registrationForm");
    this.initializeEventListeners();
    this.initializeRoleSelect();
    this.initializeAlert();
  }

  initializeEventListeners() {
    this.form.addEventListener("submit", this.handleSubmit.bind(this));

    // 전화번호 입력 시 자동 포맷팅
    const contactInput = document.getElementById("contact");
    contactInput.addEventListener("input", (e) => {
      const number = e.target.value.replace(/-/g, "");
      if (number.length === 11) {
        e.target.value = utils.formatPhoneNumber(number);
      }
    });
  }

  initializeRoleSelect() {
    const roleSelect = document.getElementById("role");

    // 직분 정의
    const roles = [
      { value: "", label: "선택하세요" },
      { value: "pastor", label: "목사" },
      { value: "minister", label: "전도사" },
      { value: "elder", label: "장로" },
      { value: "seniorDeaconess", label: "권사" },
      { value: "deaconess", label: "집사" },
      { value: "member", label: "성도" },
    ];

    // 옵션 생성
    roleSelect.innerHTML = roles
      .map(
        (role) => `
      <option value="${role.value}" ${
          role.value ? `class="${utils.roles.getClass(role.value)}"` : ""
        }>
        ${role.label}
      </option>
    `
      )
      .join("");

    // 직분 선택 시 스타�� 변경
    roleSelect.addEventListener("change", (e) => {
      const selectedRole = e.target.value;
      e.target.className = utils.roles.getClass(selectedRole);
    });
  }

  initializeAlert() {
    // 알림창 HTML 추가
    const alertHTML = `
      <div class="alert-overlay" id="alertOverlay">
        <div class="alert-box">
          <div class="alert-content">
            <div class="alert-title"></div>
            <div class="alert-message"></div>
          </div>
          <button class="alert-button">확인</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', alertHTML);

    // 알림창 요소 참조
    this.alertOverlay = document.getElementById('alertOverlay');
    this.alertTitle = this.alertOverlay.querySelector('.alert-title');
    this.alertMessage = this.alertOverlay.querySelector('.alert-message');
    this.alertButton = this.alertOverlay.querySelector('.alert-button');

    // 알림창 닫기 이벤트
    this.alertButton.addEventListener('click', () => {
      this.hideAlert();
    });
  }

  showAlert(title, message, type = 'default') {
    this.alertTitle.textContent = title;
    this.alertMessage.textContent = message;
    this.alertOverlay.className = `alert-overlay show alert-${type}`;
  }

  hideAlert() {
    this.alertOverlay.classList.remove('show');
  }

  checkDuplicateContact(contact) {
    const members = utils.data.members.getAll();
    return members.some(member => member.contact === contact);
  }

  handleSubmit(e) {
    e.preventDefault();

    // 연락처 중복 체크
    const contact = this.form.contact.value;
    if (this.checkDuplicateContact(contact)) {
      this.showAlert(
        '중복된 연락처', 
        '이미 등록된 연락처입니다.',
        'error'
      );
      this.form.contact.focus();
      return;
    }

    const formData = {
      id: Date.now(),
      name: this.form.name.value,
      contact: contact,
      birthDate: this.form.birthDate.value,
      role: this.form.role.value,
      roleName: utils.roles.getName(this.form.role.value),
      registrationDate: new Date().toISOString(),
      attendance: [],
    };

    try {
      utils.data.members.add(formData);
      this.showAlert(
        '등록 완료', 
        '새신�� 등록이 완료되었습니다.',
        'success'
      );
      this.form.reset();
    } catch (error) {
      this.showAlert(
        '오류 발생', 
        '저장 중 오류가 발생했습니다.',
        'error'
      );
      console.error("저장 오류:", error);
    }
  }
}

// 페이지 로드 시 Registration 인스턴스 생성
document.addEventListener("DOMContentLoaded", () => {
  new Registration();
});