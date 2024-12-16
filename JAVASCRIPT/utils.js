// 공통 유틸리티 함수

const utils = {
  // LocalStorage 관련 유틸리티
  storage: {
    save: (key, data) => {
      localStorage.setItem(key, JSON.stringify(data));
    },
    get: (key) => {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    },
  },

  // 날짜 포맷 유틸리티
  formatDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  // 전화번호 포맷 유틸리티
  formatPhoneNumber: (number) => {
    return number.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  },

  // 유효성 검사 유틸리티
  validate: {
    phoneNumber: (number) => {
      return /^\d{3}-\d{4}-\d{4}$/.test(number);
    },
  },

  // 직분 관련 유틸리티 수정
  roles: {
    // 직분 클래스명
    getClass: (role) => {
      const classes = {
        pastor: "role-pastor",
        minister: "role-minister", // 전도사 추가
        elder: "role-elder",
        seniorDeaconess: "role-seniorDeaconess", // 권사 추가
        deaconess: "role-deaconess",
        member: "role-member",
      };
      return classes[role] || "role-member";
    },

    // 직분 한글명
    getName: (role) => {
      const names = {
        pastor: "목사",
        minister: "전도사", // 전도사 추가
        elder: "장로",
        seniorDeaconess: "권사", // 권사 추가
        deaconess: "집사",
        member: "성도",
      };
      return names[role] || "성도";
    },

    // 직분별 정렬 우선순위
    getPriority: (role) => {
      const priority = {
        pastor: 1,
        minister: 2, // 전도사 추가
        elder: 3,
        seniorDeaconess: 4, // 권사 추가
        deaconess: 5,
        member: 6,
      };
      return priority[role] || 6;
    },
  },

  // 데이터 관리 유틸리티 추가
  data: {
    // 새신자 데이터 CRUD 작업
    members: {
      // 전체 목록 조회
      getAll: () => {
        return utils.storage.get("newMembers") || [];
      },

      // 단일 회원 조회
      getById: (id) => {
        const members = utils.storage.get("newMembers") || [];
        return members.find((m) => m.id === id);
      },

      // 새 회원 추가
      add: (member) => {
        const members = utils.storage.get("newMembers") || [];
        members.push(member);
        utils.storage.save("newMembers", members);
        return member;
      },

      // 회원 정보 수정
      update: (id, updates) => {
        const members = utils.storage.get("newMembers") || [];
        const index = members.findIndex((m) => m.id === id);
        if (index !== -1) {
          members[index] = { ...members[index], ...updates };
          utils.storage.save("newMembers", members);
          return members[index];
        }
        return null;
      },

      // 회원 삭제
      delete: (id) => {
        const members = utils.storage.get("newMembers") || [];
        const filtered = members.filter((m) => m.id !== id);
        utils.storage.save("newMembers", filtered);
      },

      
      // 데이터 내보내기
      export: () => {
        const members = utils.storage.get("newMembers") || [];
        const dataStr = JSON.stringify(members, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `faithquest_members_${
          new Date().toISOString().split("T")[0]
        }.json`;
        a.click();

        URL.revokeObjectURL(url);
      },

      // 데이터 가져오기
      import: (jsonFile) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const members = JSON.parse(e.target.result);
              utils.storage.save("newMembers", members);
              resolve(members);
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = reject;
          reader.readAsText(jsonFile);
        });
      },
    },

    // 출석 데이터 관련 기능
    attendance: {
      // 특정 날짜의 출석 현황 조회
      getByDate: (date) => {
        const members = utils.storage.get("newMembers") || [];
        return members.filter((member) =>
          member.attendance.some((record) => record.date === date)
        );
      },

      // 특정 회원의 출석 기록 조회
      getMemberHistory: (memberId) => {
        const member = utils.data.members.getById(memberId);
        return member ? member.attendance : [];
      },

      // 출석률 계산
      getAttendanceRate: (memberId, startDate, endDate) => {
        const member = utils.data.members.getById(memberId);
        if (!member) return 0;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        const attendedDays = member.attendance.filter((record) => {
          const recordDate = new Date(record.date);
          return recordDate >= start && recordDate <= end;
        }).length;

        return (attendedDays / totalDays) * 100;
      },
    },
  },
};
