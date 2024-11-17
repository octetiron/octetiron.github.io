---
title: 소스코드
description: 소스코드 모음
date: 2024-11-17 17:10:39 +0900
categories: [LAB]
tags: [manual]
toc: true
comments: false
---

> 소스코드 모음

```python
# hand_tracking_with_picamera.py
from picamera2 import Picamera2
import cv2
import mediapipe as mp

# MediaPipe Hands 초기화
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    min_detection_confidence=0.5, min_tracking_confidence=0.5, max_num_hands=2
)

# MediaPipe Drawing 유틸리티 초기화
mp_draw = mp.solutions.drawing_utils

# 웹캠 캡처 객체 생성
try:
    cap = Picamera2()
    height = 480
    width = 640
    middle = (int(width / 2), int(height / 2))
    cap.configure(
        cap.create_video_configuration(
            main={
                "format": "RGB888",
                "size": (width, height),
            },
        )
    )
    cap.set_controls({"FrameRate": 120})
    cap.start()

except:
    print("camera_error1")


while True:
    # 프레임 읽기
    success, frame = True, cap.capture_array()
    if not success:
        print("camera_error2")
        break

    # BGR을 RGB로 변환
    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # 성능 향상을 위해 이미지 쓰기 불가로 설정
    image.flags.writeable = False

    # 손 감지 수행
    results = hands.process(image)

    # 이미지를 다시 BGR로 변환
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

    # 손이 감지되면 랜드마크 그리기
    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            # 손의 랜드마크 그리기
            mp_draw.draw_landmarks(
                image,
                hand_landmarks,
                mp_hands.HAND_CONNECTIONS,
                mp_draw.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
                mp_draw.DrawingSpec(color=(255, 0, 0), thickness=2),
            )

    # 결과 화면 표시
    cv2.imshow("Hand Tracking", image)

    # 'q' 키를 누르면 종료
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

# 리소스 해제
cv2.destroyAllWindows()
hands.close()
```

```python
# simple_music_player.py
```
