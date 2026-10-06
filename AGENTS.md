# AGENTS.md

Claude Code와 Codex 양쪽에서 설치할 수 있는 플러그인 마켓플레이스 저장소다.
에이전트용 지침은 이 파일 하나만 둔다. `CLAUDE.md`는 만들지 않는다.
저장소의 목적과 정책은 `README.md`에 있다.

## 구조

```
.claude-plugin/marketplace.json     Claude Code 마켓플레이스 (name: makers)
.agents/plugins/marketplace.json    Codex 마켓플레이스 (name: makers)
shared/                             세 플러그인이 공유하는 절차 문서의 원본
scripts/sync-shared.mjs             shared/ → 각 플러그인 복사, --check 로 불일치 검사
plugins/<플러그인>/
  .claude-plugin/plugin.json        Claude Code 플러그인 매니페스트
  .codex-plugin/plugin.json         Codex 플러그인 매니페스트 (skills: ./skills/)
  skills/<스킬>/SKILL.md            스킬 본체
  skills/<스킬>/references/         그 스킬 전용 상세 문서
  skills/<스킬>/references/shared/  shared/ 의 복사본 (직접 수정 금지)
```

| 플러그인 | 스킬 | 최종 산출물 |
|---|---|---|
| `goal-makers` | `goal-maker` | `goal.md` 묶음 |
| `skill-makers` | `skill-maker` | 스킬 디렉터리 |
| `agent-makers` | `agent-maker` | 에이전트 정의 파일 |

## 규칙

- 한 플러그인 안에서 스킬 내용은 `plugins/<플러그인>/skills/<스킬>/` 한 곳에만 둔다. 호스트별 디렉터리로 복사하지 않는다.
  같은 플러그인의 두 매니페스트는 같은 `skills/`를 공유한다.
- 같은 플러그인의 `.claude-plugin/plugin.json`과 `.codex-plugin/plugin.json`의 공통 필드
  (`name`, `description`, `version`, `author`, `license`, `keywords`)는 항상 동일하게 유지한다.
  하나를 고치면 다른 하나도 같이 고친다.
- 스킬 동작이 바뀌면 그 플러그인의 두 매니페스트 `version`을 함께 올린다.
  `shared/`가 바뀌면 세 플러그인 모두 올린다.
- 플러그인을 추가·삭제하면 두 마켓플레이스 파일을 함께 고친다.
- `SKILL.md`는 호스트 중립적으로 쓴다. 특정 호스트 전용 도구 이름(예: Claude의 `Read`, `Bash`)을
  전제하지 말고 "파일을 읽는다", "명령을 실행한다"처럼 행위로 적는다.
- `SKILL.md`는 짧게 유지하고, 상세 내용은 `references/`로 분리해 필요할 때만 읽게 한다.
- 스킬 내부 경로는 `SKILL.md` 기준 상대 경로로 쓴다. 설치 위치가 현재 작업 디렉터리라고 가정하지 않는다.
  플러그인 밖의 문서는 함께 배포된다고 보장할 수 없으므로, 스킬이 따르는 참고 문서는 자기 플러그인 안에 둔다.
  다른 플러그인이나 루트 `shared/`를 직접 참조하지 않는다. 작업 대상 프로젝트의 파일을 읽는 것은 이 규칙과 무관하다.
- 세 플러그인이 공유하는 절차 문서(수렴리뷰·결함 판정·교차 검증·산출물 구조)의 원본은 루트 `shared/`에만 둔다.
  각 플러그인의 `references/shared/` 복사본은 `node scripts/sync-shared.mjs`로만 만들고 직접 고치지 않는다.
  원본을 고치면 같은 커밋에서 동기화한다. `node scripts/sync-shared.mjs --check`가 불일치를 실패로 잡는다.
- 슬래시 커맨드가 필요해지면 해당 플러그인의 `commands/`에 두고, 로직은 다시 구현하지 말고
  그 플러그인 스킬의 `references/` 문서를 참조만 한다.
- 교차 검증(상대 AI에게 산출물 수행 가능 여부를 묻는 단계)은 Orca 오케스트레이션으로만 수행한다.
  수행 조건을 충족하지 못하면 교차 검증을 건너뛰고 그 사실을 결과 보고에 남긴다.
  상대 CLI 직접 호출이나 파일 메일박스 같은 대체 경로를 만들지 않는다.
- 스킬에 Orca 명령을 직접 적지 않는다. Orca가 제공하는 버전 일치 가이드를 불러와 따르게 한다.
- 스킬이 만드는 최종 산출물(goal·skill·agent)은 makers와 독립적이어야 한다. `.makers/` 중간 문서,
  makers 플러그인, Orca, 생성 당시의 절대 경로에 의존하는 산출물을 만들지 않는다.
  goal만 예외로 `plans/`·`spec/`·`impl_plans/`·`goal.md` 묶음 전체가 이식 단위이며, 묶음 안에서만 서로 참조한다.
- 산출물 독립성·교차 검증 조건·결과 판정·리뷰 라운드 상한·`.makers/` 구조의 정본은 `README.md`다.
  `shared/`와 스킬은 그 정책을 그대로 구현한다. 정책을 바꾸려면 `README.md`부터 고친다.
