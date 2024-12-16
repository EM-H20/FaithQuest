// 출석 관리 로직

class Attendance {
  constructor() {
    this.attendanceDate = document.getElementById("attendanceDate");
    this.attendanceTable = document.getElementById("attendanceTable");
    this.attendanceBody = document.getElementById("attendanceBody");
    this.saveButton = document.getElementById("saveAttendance");
    this.searchInput = document.getElementById('searchInput');
    this.roleFilter = document.getElementById('roleFilter');

    this.initializeDate();
    this.initializeEventListeners();
    this.loadMembers();

    // 이벤트 리스너 추가
    this.searchInput.addEventListener('input', () => this.loadMembers());
    this.roleFilter.addEventListener('change', () => this.loadMembers());
  }

  initializeDate() {
    // 오늘 날짜를 기본값으로 설정
    const today = new Date().toISOString().split("T")[0];
    this.attendanceDate.value = today;
  }

  initializeEventListeners() {
    this.attendanceDate.addEventListener("change", () => this.loadMembers());
    this.saveButton.addEventListener("click", () => this.saveAttendance());
  }

  loadMembers() {
    let members = utils.data.members.getAll();
    const searchTerm = this.searchInput.value.toLowerCase();
    const roleFilter = this.roleFilter.value;

    // 검색어로 필터링
    if (searchTerm) {
      members = members.filter(member => 
        member.name.toLowerCase().includes(searchTerm) ||
        member.contact.replace(/-/g, '').includes(searchTerm.replace(/-/g, ''))
      );
    }

    // 직분으로 필터링
    if (roleFilter) {
      members = members.filter(member => member.role === roleFilter);
    }

    // 직분별 정렬
    const sortedMembers = members.sort((a, b) => 
      utils.roles.getPriority(a.role) - utils.roles.getPriority(b.role)
    );

    this.renderMembers(sortedMembers);
  }

  renderMembers(members) {
    this.attendanceBody.innerHTML = '';
    let currentRole = null;
    const searchTerm = this.searchInput.value.toLowerCase();

    members.forEach(member => {
      if (currentRole !== member.role) {
        currentRole = member.role;
        const divider = document.createElement('tr');
        divider.className = 'role-divider';
        divider.innerHTML = `
          <td colspan="4" class="role-header ${utils.roles.getClass(member.role)}">
            ${utils.roles.getName(member.role)}
          </td>
        `;
        this.attendanceBody.appendChild(divider);
      }

      const row = document.createElement('tr');
      
      // 검색어 하이라이트 처리
      const highlightText = (text, term) => {
        if (!term) return text;
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
      };

      row.innerHTML = `
        <td>${highlightText(member.name, searchTerm)}</td>
        <td>
          <span class="role-tag ${utils.roles.getClass(member.role)}">
            ${utils.roles.getName(member.role)}
          </span>
        </td>
        <td>${highlightText(member.contact, searchTerm)}</td>
        <td>
          <input type="checkbox" 
                 class="attendance-checkbox" 
                 data-member-id="${member.id}"
                 ${this.isAttended(member.id) ? 'checked' : ''}>
        </td>
      `;

      this.attendanceBody.appendChild(row);
    });

    // 검색 결과가 없을 경우 메시지 표시
    if (members.length === 0) {
      const noResults = document.createElement('tr');
      noResults.innerHTML = `
        <td colspan="4" class="no-results">
          검색 결과가 없습니다.
        </td>
      `;
      this.attendanceBody.appendChild(noResults);
    }
  }

  isAttended(memberId) {
    const attendance = utils.data.attendance.getMemberHistory(memberId);
    return attendance.some(
      (record) => record.date === this.attendanceDate.value
    );
  }

  saveAttendance() {
    const members = utils.data.members.getAll();
    const checkboxes = document.querySelectorAll(".attendance-checkbox");
    const currentDate = this.attendanceDate.value;

    checkboxes.forEach((checkbox) => {
      const memberId = parseInt(checkbox.dataset.memberId);
      const member = members.find((m) => m.id === memberId);

      if (!member) return;

      // 출석 기록 업데이트
      const updatedAttendance = member.attendance.filter(
        (record) => record.date !== currentDate
      );

      if (checkbox.checked) {
        updatedAttendance.push({
          date: currentDate,
          attended: true,
        });

        // 날짜순으로 정렬 (오름차순)
        updatedAttendance.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA - dateB;
        });
      }

      // 회원 정보 업데이트
      utils.data.members.update(memberId, {
        attendance: updatedAttendance,
      });
    });

    alert("출석이 저장되었습니다.");
  }
}

// 페이지 로드 시 Attendance 인스턴스 생성
document.addEventListener("DOMContentLoaded", () => {
  new Attendance();
});
