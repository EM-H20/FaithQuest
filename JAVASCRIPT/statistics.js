// 통계 관련 로직

class Statistics {
    constructor() {
        this.startDate = document.getElementById('startDate');
        this.endDate = document.getElementById('endDate');
        this.updateButton = document.getElementById('updateStats');
        
        this.initializeDates();
        this.initializeEventListeners();
        this.loadStatistics();
    }

    initializeDates() {
        // 기본값: 이번달 1일 ~ 오늘
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        
        this.startDate.value = firstDay.toISOString().split('T')[0];
        this.endDate.value = today.toISOString().split('T')[0];
    }

    initializeEventListeners() {
        this.updateButton.addEventListener('click', () => this.loadStatistics());
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
            'pastor': '목사',
            'minister': '전도사',
            'elder': '장로',
            'seniorDeaconess': '권사',
            'deaconess': '집사',
            'member': '성도'
        };

        members.forEach(member => {
            roleStats[member.role] = (roleStats[member.role] || 0) + 1;
        });

        const ctx = document.getElementById('roleChart').getContext('2d');
        const chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(roleStats).map(role => roles[role]),
                datasets: [{
                    data: Object.values(roleStats),
                    backgroundColor: [
                        '#4A90E2', '#48BB78', '#F5A623', 
                        '#9F7AEA', '#ED64A6', '#718096'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    updateRegistrationChart(members) {
        const monthlyStats = {};
        const start = new Date(this.startDate.value);
        const end = new Date(this.endDate.value);

        members.forEach(member => {
            const regDate = new Date(member.registrationDate);
            if (regDate >= start && regDate <= end) {
                const monthKey = `${regDate.getFullYear()}-${regDate.getMonth() + 1}`;
                monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + 1;
            }
        });

        const ctx = document.getElementById('registrationChart').getContext('2d');
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(monthlyStats).map(month => {
                    const [year, m] = month.split('-');
                    return `${year}년 ${m}월`;
                }),
                datasets: [{
                    label: '등록 인원',
                    data: Object.values(monthlyStats),
                    backgroundColor: '#3498DB'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    updateAttendanceChart(members) {
        const attendanceRates = members.map(member => ({
            name: member.name,
            rate: utils.data.attendance.getAttendanceRate(
                member.id,
                this.startDate.value,
                this.endDate.value
            )
        }));

        const ctx = document.getElementById('attendanceChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: attendanceRates.map(item => item.name),
                datasets: [{
                    label: '출석률',
                    data: attendanceRates.map(item => item.rate),
                    borderColor: '#2ECC71',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    updateSummary(members) {
        const start = new Date(this.startDate.value);
        const end = new Date(this.endDate.value);
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();

        const newMembersCount = members.filter(member => {
            const regDate = new Date(member.registrationDate);
            return regDate.getMonth() === thisMonth && 
                   regDate.getFullYear() === thisYear;
        }).length;

        const avgAttendance = members.reduce((sum, member) => {
            return sum + utils.data.attendance.getAttendanceRate(
                member.id,
                this.startDate.value,
                this.endDate.value
            );
        }, 0) / members.length;

        document.getElementById('totalMembers').textContent = `${members.length}명`;
        document.getElementById('newMembers').textContent = `${newMembersCount}명`;
        document.getElementById('avgAttendance').textContent = `${avgAttendance.toFixed(1)}%`;
    }
}

// 페이지 로드 시 Statistics 인스턴스 생성
document.addEventListener('DOMContentLoaded', () => {
    new Statistics();
});