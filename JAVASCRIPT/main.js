/**
  FaithQuest 메인 대시보드 관리
  
  주요 기능:
  1. 최근 등록 현황
     - 최근 등록된 새신자 목록 표시
     - 이름, 직분, 연락처, 등록일 표시
     - 최신순 정렬
  
  2. 오늘의 출석 현황
     - 전체 인원 표시
     - 오늘 출석 인원 표시
     - 출석률 계산 및 표시
  
  3. 데이터 자동 갱신
     - 페이지 로드 시 최신 데이터 표시
     - LocalStorage 데이터 실시간 반영
 */
class Dashboard {
  constructor() {
    this.initializeDashboard();
    // 1분마다 대시보드 업데이트
    setInterval(() => this.initializeDashboard(), 60000);
  }
  // 대시보드 초기화
  initializeDashboard() {
    this.loadRecentRegistrations();
    this.updateTodayAttendance();
  }

  // 최근 등록 현황 로드 (최근 5명)
  loadRecentRegistrations() {
    const members = utils.data.members.getAll();
    const recentMembers = members
      .sort(
        (a, b) => new Date(b.registrationDate) - new Date(a.registrationDate)
      )
      .slice(0, 5);

    const tbody = document.getElementById("recentMembersBody");
    tbody.innerHTML = "";
    // 최근 등록된 새신자 목록 표시
    recentMembers.forEach((member) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${member.name}</td>
                <td>
                    <span class="role-tag ${utils.roles.getClass(member.role)}">
                        ${utils.roles.getName(member.role)}
                    </span>
                </td>
                <td>${member.contact}</td>
                <td>${new Date(
                  member.registrationDate
                ).toLocaleDateString()}</td>
            `;
      tbody.appendChild(row);
    });

    // 등록된 회원이 없는 경우
    if (recentMembers.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML =
        '<td colspan="4" class="no-data">등록된 회원이 없습니다.</td>';
      tbody.appendChild(row);
    }
  }

  // 오늘의 출석 현황 업데이트
  updateTodayAttendance() {
    const today = new Date().toISOString().split("T")[0];
    const members = utils.data.members.getAll();
    const totalMembers = members.length;

    // 오늘 출석한 회원 수 계산
    const attendedMembers = members.filter((member) =>
      member.attendance.some(
        (record) => record.date === today && record.attended
      )
    ).length;

    // 출석률 계산
    const attendanceRate =
      totalMembers > 0
        ? ((attendedMembers / totalMembers) * 100).toFixed(1)
        : 0;

    // UI 업데이트
    document.getElementById("totalMembers").textContent = `${totalMembers}명`;
    document.getElementById(
      "attendedMembers"
    ).textContent = `${attendedMembers}명`;
    document.getElementById(
      "todayAttendanceRate"
    ).textContent = `${attendanceRate}%`;
  }
}

// 페이지 로드 시 Dashboard 인스턴스 생성
document.addEventListener("DOMContentLoaded", () => {
  new Dashboard();
});
