# 2024 HY-THON 2팀 백엔드

🏆 **2024 HY-THON(한양대학교 ERICA 교내 연합 해커톤) 대상 수상** 🥇

# Theme

```
🍀
올해의 주제는 "보통의 하루"입니다.
우리는 언제나 더 나은 삶, 더 높은 성취를 향해 달려가지만, 때로는 너무 치열한 하루가 우리의 마음을 지치게 만들기도 합니다. 이번 해커톤에서는 "갓생이 아닌 걍생"에 초점을 맞춰, 사람들의 일상을 더 안정적이고 편안하게 만들어주는 솔루션을 고민하고자 합니다.

주제 설명:
- 목표: 바쁜 현대인들이 평온한 하루를 보낼 수 있도록 돕는 서비스나 아이디어를 개발.

복잡하거나 대단하지 않아도 괜찮습니다. 보통의 하루가 특별해질 수 있도록, 여러분의 창의력을 마음껏 발휘해 보세요!

여러분의 멋진 아이디어를 기대합니다!
```

우리 팀이 만든 '하루로그'는 바쁜 사회 속 소소한 재미를 주고 하루를 간단히 마무리할 수 있는 서비스를 제공합니다.
사용자는 하루와 관련된 키워드로 짧은 글과 낙서를 작성하고, AI 각색 버튼을 눌러 입력한 내용을 새롭게 각색하거나 내일 할 일 등을 추천받을 수 있습니다.
이를 통해 바쁜 하루를 가볍게 정리하고 소소한 재미로 마음의 안정을 느낄 수 있습니다.

# Harulog Architecture

![image](./harulog/public/img/architecture.png)

위 구성도는 2024 HY-THON D-Day에 Oracle Cloud Infrastructure에 배포했던 하루로그 구성도이며,
현재 리포지토리는 이 중 프론트엔드, 백엔드(OpenAI API 관련 로직 포함)만을 포함합니다.

# Usage

1. `.env.example` 파일을 복사해 `.env` 파일을 만들고 적절한 값을 입력하고 저장합니다.
2. 터미널에 아래 명령어를 입력합니다.

참고: `path/to/project`는 `compose.yml` 파일이 위치한 경로입니다.

```
cd path/to/project
npm --prefix harulog i
docker compose up -d
```

# Preview

![image](./harulog/public/img/1.png)

![image](./harulog/public/img/2.png)

![image](./harulog/public/img/3.png)

![image](./harulog/public/img/4.png)

![image](./harulog/public/img/5.png)

![image](./harulog/public/img/6.png)
