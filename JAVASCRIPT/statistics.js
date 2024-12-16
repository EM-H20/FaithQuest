// 통계 관련 로직

class Statistics {
  constructor() {
    this.startDate = document.getElementById("startDate");
    this.endDate = document.getElementById("endDate");
    this.updateButton = document.getElementById("updateStats");

    // 차트 인스턴스를 저장할 변수들
    this.roleChart = null;
    this.registrationChart = null;
    this.attendanceChart = null;

    this.initializeDates();
    this.initializeEventListeners();
    this.loadStatistics();
  }

  initializeDates() {
    // 기본값: 이번달 1일 ~ 오늘
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    // 시작일과 종료일 초기값 설정
    this.startDate.value = firstDay.toISOString().split("T")[0];
    this.endDate.value = today.toISOString().split("T")[0];

    // 시작일의 최대값을 종료일로 제한
    this.startDate.max = this.endDate.value;
    // 종료일의 최소값을 시작일로 제한
    this.endDate.min = this.startDate.value;
  }

  initializeEventListeners() {
    // 시작일 변경 이벤트
    this.startDate.addEventListener('change', () => {
      // 종료일의 최소값을 시작일로 업데이트
      this.endDate.min = this.startDate.value;
      
      // 종료일이 시작일보다 이전이면 종료일을 시작일로 설정
      if (this.endDate.value < this.startDate.value) {
        this.endDate.value = this.startDate.value;
      }
    });

    // 종료일 변경 이벤트
    this.endDate.addEventListener('change', () => {
      // 시작일의 최대값을 종료일로 업데이트
      this.startDate.max = this.endDate.value;
      
      // 시작일이 종료일보다 이후면 시작일을 종료일로 설정
      if (this.startDate.value > this.endDate.value) {
        this.startDate.value = this.endDate.value;
      }
    });

    // 조회 버튼 클릭 이벤트
    this.updateButton.addEventListener("click", () => {
      if (this.roleChart) this.roleChart.destroy();
      if (this.registrationChart) this.registrationChart.destroy();
      if (this.attendanceChart) this.attendanceChart.destroy();
      this.loadStatistics();
    });
  }

  loadStatistics() {
    const members = utils.data.members.getAll();

    this.updateRoleChart(members);
    this.updateRegistrationChart(members);
    this.updateAttendanceChart(members);
    this.updateSummary(members);
  }

  updateRoleChart(members) {
    const roleStats = {};
    const roles = {
      pastor: "목사",
      minister: "전도사",
      elder: "장로",
      seniorDeaconess: "권사",
      deaconess: "집사",
      member: "성도",
    };

    members.forEach((member) => {
      roleStats[member.role] = (roleStats[member.role] || 0) + 1;
    });

    const ctx = document.getElementById("roleChart").getContext("2d");
    this.roleChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: Object.keys(roleStats).map((role) => roles[role]),
        datasets: [
          {
            data: Object.values(roleStats),
            backgroundColor: [
              "#4A90E2",
              "#48BB78",
              "#F5A623",
              "#9F7AEA",
              "#ED64A6",
              "#718096",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }

  updateRegistrationChart(members) {
    const monthlyStats = {};
    const start = new Date(this.startDate.value);
    const end = new Date(this.endDate.value);

    members.forEach((member) => {
      const regDate = new Date(member.registrationDate);
      if (regDate >= start && regDate <= end) {
        const monthKey = `${regDate.getFullYear()}-${regDate.getMonth() + 1}`;
        monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + 1;
      }
    });

    const ctx = document.getElementById("registrationChart").getContext("2d");
    this.registrationChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(monthlyStats).map((month) => {
          const [year, m] = month.split("-");
          return `${year}년 ${m}월`;
        }),
        datasets: [
          {
            label: "등록 인원",
            data: Object.values(monthlyStats),
            backgroundColor: "#3498DB",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }

  updateAttendanceChart(members) {
    // 기존 차트가 있다면 제거
    if (this.attendanceChart) {
      this.attendanceChart.destroy();
    }

    const start = this.startDate.value;
    const end = this.endDate.value;

    // 선택한 기간의 모든 날짜 생성
    const dates = [];
    let currentDate = new Date(start);
    const endDate = new Date(end);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate).toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 날짜별 출석률 계산
    const attendanceData = dates.map(date => {
      const attendedCount = members.filter(member => {
        const attendance = member.attendance.find(a => a.date === date);
        return attendance && attendance.attended;
      }).length;
      
      return {
        date: date,
        rate: members.length > 0 ? (attendedCount / members.length) * 100 : 0
      };
    });

    const ctx = document.getElementById("attendanceChart").getContext("2d");
    this.attendanceChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: attendanceData.map(item => 
          new Date(item.date).toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric'
          })
        ),
        datasets: [{
          label: "출석률 (%)",
          data: attendanceData.map(item => item.rate.toFixed(1)),
          borderColor: "#2ECC71",
          backgroundColor: "rgba(46, 204, 113, 0.1)",
          tension: 0.1,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: '출석률 (%)'
            }
          },
          x: {
            title: {
              display: true,
              text: '날짜'
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return `출석률: ${context.parsed.y}%`;
              }
            }
          }
        }
      }
    });
  }

  updateSummary(members) {
    const start = this.startDate.value;
    const end = this.endDate.value;

    // 선택한 기간의 전체 출석 기록
    let totalAttendance = 0;
    let totalDays = 0;

    members.forEach(member => {
      const periodAttendance = member.attendance.filter(record => 
        record.date >= start && record.date <= end
      );
      
      totalDays += periodAttendance.length;
      totalAttendance += periodAttendance.filter(record => record.attended).length;
    });

    // 평균 출석률 계산
    const avgAttendance = totalDays > 0 ? (totalAttendance / totalDays) * 100 : 0;

    // 이번달 신규 등록자 수 계산
    const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const newMembersCount = members.filter(member => 
      member.registrationDate.startsWith(thisMonth)
    ).length;

    // UI 업데이트
    document.getElementById("totalMembers").textContent = `${members.length}명`;
    document.getElementById("newMembers").textContent = `${newMembersCount}명`;
    document.getElementById("avgAttendance").textContent = `${avgAttendance.toFixed(1)}%`;
  }
}

// 페이지 로드 시 Statistics 인스턴스 생성
document.addEventListener("DOMContentLoaded", () => {
  new Statistics();
});
