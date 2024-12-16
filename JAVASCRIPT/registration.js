// 새신자 등록 관련 로직

class Registration {
  constructor() {
    this.form = document.getElementById("registrationForm");
    this.initializeEventListeners();
    this.initializeRoleSelect();
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

    // 직분 선택 시 스타일 변경
    roleSelect.addEventListener("change", (e) => {
      const selectedRole = e.target.value;
      e.target.className = utils.roles.getClass(selectedRole);
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    const formData = {
      id: Date.now(),
      name: this.form.name.value,
      contact: this.form.contact.value,
      birthDate: this.form.birthDate.value,
      role: this.form.role.value,
      roleName: utils.roles.getName(this.form.role.value),
      registrationDate: new Date().toISOString(),
      attendance: [],
    };

    try {
      utils.data.members.add(formData);
      alert("새신자 등록이 완료되었습니다.");
      this.form.reset();
    } catch (error) {
      alert("저장 중 오류가 발생했습니다.");
      console.error("저장 오류:", error);
    }
  }
}

// 페이지 로드 시 Registration 인스턴스 생성
document.addEventListener("DOMContentLoaded", () => {
  new Registration();
});
