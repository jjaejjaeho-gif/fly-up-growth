# Fly-Up 성장기록장

VS Code에서 React 화면을 만들고, Google Apps Script 웹앱 API를 통해 Google Sheets에 학생 성장 기록을 저장하는 프로젝트입니다.

## 지금 들어있는 기능

- 모바일 최적화 학생 기록 화면
- 학생 이름 선택 또는 직접 입력
- 플라잉디스크 활동 다중 선택
- 이모지 기반 자기성찰 점수
- 느낀점 작성
- Google Apps Script 웹앱으로 저장 요청 전송
- Google Sheets `기록` 시트 자동 생성
- 향후 조회/사진/교사 피드백 API 확장을 위한 `action` 기반 payload 구조

## 실행

```bash
npm install
npm run dev
```

## React와 Apps Script 연결 순서

1. Google Sheets를 하나 만듭니다.
2. 스프레드시트 주소에서 ID를 복사합니다.

   예시:

   ```text
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```

3. Apps Script 프로젝트를 만들고 [apps-script/Code.gs](apps-script/Code.gs)를 붙여 넣습니다.
4. `Code.gs`의 `SPREADSHEET_ID`를 실제 ID로 바꿉니다.

   ```js
   SPREADSHEET_ID: 'PUT_YOUR_SPREADSHEET_ID_HERE'
   ```

5. Apps Script에서 `배포 > 새 배포 > 웹 앱`을 선택합니다.
6. 설정은 다음처럼 둡니다.

   ```text
   실행 권한: 나
   액세스 권한: 모든 사용자
   ```

7. 배포 후 `/exec`로 끝나는 웹앱 URL을 복사합니다.
8. 프로젝트 루트의 `.env`에 넣습니다.

   ```env
   VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/배포_ID/exec
   ```

9. React 개발 서버를 다시 시작합니다.

   ```bash
   npm run dev
   ```

## 중요한 점

React에서 Apps Script로 저장할 때는 브라우저 CORS 문제를 피하기 위해 `mode: 'no-cors'`로 보냅니다.

그래서 React는 Google Apps Script의 응답 내용을 직접 읽을 수 없습니다. 대신 요청을 확실히 보내고, Apps Script가 `기록` 시트에 `appendRow` 하도록 구성했습니다.

Apps Script 코드를 고친 뒤에는 반드시 새 버전으로 다시 배포해야 합니다. URL이 같아도 새 버전 배포를 하지 않으면 이전 코드가 계속 실행될 수 있습니다.

## 저장 payload

React는 Apps Script로 아래 구조를 보냅니다.

```json
{
  "apiVersion": "2026-05-27",
  "action": "createGrowthRecord",
  "record": {
    "submissionId": "uuid",
    "submittedAt": "ISO timestamp",
    "date": "2026-05-27",
    "studentName": "김도윤",
    "activities": ["패스 연습", "캐치 연습"],
    "reflection": {
      "cooperation": 3,
      "participation": 4,
      "cheering": 3,
      "rules": 3,
      "selfPractice": 2
    },
    "reflectionAverage": "3.0",
    "memo": "오늘 패스를 열심히 연습했다."
  }
}
```

나중에 `getRecords`, `createFeedback`, `uploadMedia` 같은 action을 추가하면 같은 Apps Script API를 확장해서 쓸 수 있습니다.
