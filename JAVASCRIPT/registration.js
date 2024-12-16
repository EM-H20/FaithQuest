/**
 * FaithQuest 새신자 등록 클래스
 * 
 * 주요 기능:
 * 1. 새신자 정보 등록
 *    - 이름, 연락처, 생년월일, 직분 입력
 *    - 필수 입력 항목 검증
 *    - 연락처 중복 체크
 * 
 * 2. 데이터 처리
 *    - 전화번호 자동 포맷팅 (010-0000-0000)
 *    - LocalStorage에 데이터 저장
 *    - 직분별 색상 구분
 * 
 * 3. 사용자 피드백
 *    - 등록 완료/오류 알림
 *    - 중복 연락처 알림
 *    - 폼 초기화 및 스타일 리셋
 */

class Registration {
    constructor() {
        // DOM 요소 초기화
        this.form = document.getElementById("registrationForm");
        this.initializeEventListeners();
        this.initializeRoleSelect();
        this.initializeAlert();
    }

    /**
     * 이벤트 리스너 초기화
     * - 폼 제출 이벤트
     * - 전화번호 자동 포맷팅
     */
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

    /**
     * 직분 선택 초기화
     * - 직분 옵션 생성
     * - 직분별 색상 적용
     * - 선택 시 스타일 변경
     */
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
            .map(role => `
                <option value="${role.value}" 
                    ${role.value ? `class="${utils.roles.getClass(role.value)}"` : ""}>
                    ${role.label}
                </option>
            `)
            .join("");

        // 직분 선택 시 스타일 변경
        roleSelect.addEventListener("change", (e) => {
            const selectedRole = e.target.value;
            e.target.className = utils.roles.getClass(selectedRole);
        });
    }

    /**
     * 알림창 초기화
     * - 알림창 HTML 추가
     * - 이벤트 리스너 설정
     */
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
        document.body.insertAdjacentHTML("beforeend", alertHTML);

        // 알림창 요소 참조
        this.alertOverlay = document.getElementById("alertOverlay");
        this.alertTitle = this.alertOverlay.querySelector(".alert-title");
        this.alertMessage = this.alertOverlay.querySelector(".alert-message");
        this.alertButton = this.alertOverlay.querySelector(".alert-button");

        // 알림창 닫기 이벤트
        this.alertButton.addEventListener("click", () => {
            this.hideAlert();
        });
    }

    /**
     * 연락처 중복 체크
     * @param {string} contact - 입력된 연락처
     * @returns {boolean} - 중복 여부
     */
    checkDuplicateContact(contact) {
        const members = utils.data.members.getAll();
        return members.some(member => member.contact === contact);
    }

    /**
     * 폼 제출 처리
     * - 연락처 중복 체크
     * - 데이터 저장
     * - 완료/오류 알림
     * - 폼 초기화
     */
    handleSubmit(e) {
        e.preventDefault();

        // 연락처 중복 체크
        const contact = this.form.contact.value;
        if (this.checkDuplicateContact(contact)) {
            this.showAlert("중복된 연락처", "이미 등록된 연락처입니다.", "error");
            this.form.contact.focus();
            return;
        }

        // 새신자 데이터 생성
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
            // 데이터 저장
            utils.data.members.add(formData);
            this.showAlert("등록 완료", "새신자 등록이 완료되었습니다.", "success");

            // 폼 초기화
            this.form.reset();

            // 직분 선택 스타일 초기화
            const roleSelect = document.getElementById("role");
            roleSelect.className = "";
        } catch (error) {
            this.showAlert("오류 발생", "저장 중 오류가 발생했습니다.", "error");
            console.error("저장 오류:", error);
        }
    }

    showAlert(title, message, type = "default") {
        this.alertTitle.textContent = title;
        this.alertMessage.textContent = message;
        this.alertOverlay.className = `alert-overlay show alert-${type}`;
    }

    hideAlert() {
        this.alertOverlay.classList.remove("show");
    }
}

// 페이지 로드 시 Registration 인스턴스 생성
document.addEventListener("DOMContentLoaded", () => {
    new Registration();
});
