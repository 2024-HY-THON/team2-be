# team2-be
하이톤 2팀 백엔드입니다.

# Commit Rules

## Commit Message Structure
**타입(스코프): 주제(제목)**

| 타입       | 설명                                         |
|------------|----------------------------------------------|
| feat       | 새로운 기능에 대한 커밋                      |
| fix        | 버그 수정에 대한 커밋                       |
| build      | 빌드 관련 파일 수정 / 모듈 설치 또는 삭제에 대한 커밋 |
| chore      | 그 외 자잘한 수정에 대한 커밋               |
| docs       | 문서 수정에 대한 커밋                       |
| style      | 코드 스타일 혹은 포맷 등에 관한 커밋         |
| refactor   | 코드 리팩토링에 대한 커밋                   |
| test       | 테스트 코드 수정에 대한 커밋                |
| perf       | 성능 개선에 대한 커밋                       |

---

## Git Branch Rules

### Branch Types

## Organization repository
- **main branch**
  - main 브랜치는 본래 이름 그대로 사용.
  - 항상 서비스 가능한 상태 유지

- **hotfix branch**  
  - hotfix 브랜치는 main 브랜치에 이상이 있을 때 사용.
  - 수정사항을 빠르게 반영하고, main브랜치에 병합.
  - 형식: `hotfix-...`
    - 예: `hotfix/핫픽스내용요약`

## Forked repository
- **main branch**
  - 조직 리포지토리의 최신상태를 따라가야함.

- **feature branch**  
  - `master`, `develop`, `release-...`, `hotfix-...` 제외 전부 가능.  
  - 형식: `feature/기능요약`
    - 예: `feature/login`

from [YeonDeok](https://github.com/YeonDeok)
