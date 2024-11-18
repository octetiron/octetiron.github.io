---
title: 시스템 개발 매뉴얼 2
description: MediaPIPE를 통해 손가락 인식하기
date: 2024-11-04 05:51:59 +0900
categories: [LAB]
tags: [manual]
toc: true
comments: false
---

> MediaPIPE를 통해 손가락 인식하기

손가락을 안정적으로 인식시키기 위하여 여러 방법을 찾던 도중 [MediaPipe](https://github.com/google-ai-edge/mediapipe)를 알게 되었다.

[MediaPipe](https://github.com/google-ai-edge/mediapipe)는 아래와 같은 기능들을 가지고 있다.

|솔루션|
|----------|
|LLM Inference API|
|객체 감지|
|이미지 분류|
|이미지 분할|
|손 랜드마크 감지|
|동작 인식|
|이미지 삽입|
|얼굴 인식|
|얼굴 즉징 감지|
|얼굴 스타일 지정|
|자세 랜드마크 인식|
|이미지 생성|
|텍스트 분류|
|텍스트 임베딩|
|언어 감지기|
|오디오 분류|

나는 이 기능들 중, [손 랜드마크 감지](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker?hl=ko) 기능을 이용하여, 손가락의 위치를 감지하기로 했다.

우선 이 기능을 구성하는 옵션으로는 아래 6가지가 있다.

| 옵션 이름                     | 설명                                                                                                                                                                                                                                                                                                                                    | 값 범위                     | 기본값         |
|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------|----------------|
| running_mode                  | 작업의 실행 모드를 설정합니다. 모드는 세 가지가 있습니다.  IMAGE: 단일 이미지 입력 모드입니다.  VIDEO: 동영상의 디코딩된 프레임에 대한 모드입니다.  LIVE_STREAM: 카메라에서 전송하는 것과 같은 입력 데이터의 실시간 스트림 모드입니다. 이 모드에서는 resultListener를 호출하여 비동기식으로 결과를 수신하도록 리스너를 설정해야 합니다. | {IMAGE, VIDEO, LIVE_STREAM} | IMAGE          |
| num_hands                     | 손 랜드마크 감지기에서 감지한 최대 손 수입니다.                                                                                                                                                                                                                                                                                         | Any integer > 0             | 1              |
| min_hand_detection_confidence | 손바닥 감지 모델에서 성공적인 것으로 간주하기 위한 손 감지의 최소 신뢰도 점수입니다.                                                                                                                                                                                                                                                    | 0.0 - 1.0                   | 0.5            |
| min_hand_presence_confidence  | 손 랜드마크 감지 모델에서 손 존재 점수의 최소 신뢰도 점수입니다. 동영상 모드와 실시간 스트림 모드에서 손 랜드마크 모델의 손 존재 신뢰도 점수가 이 임계값보다 낮으면 손 랜드마크 도구는 손바닥 감지 모델을 트리거합니다. 그러지 않으면 가벼운 손 추적 알고리즘이 후속 랜드마크 감지를 위해 손의 위치를 결정합니다.                       | 0.0 - 1.0                   | 0.5            |
| min_tracking_confidence       | 손바닥 추적을 성공으로 간주하기 위한 최소 신뢰도 점수입니다. 이는 현재 프레임과 마지막 프레임의 침 사이의 경계 상자 IoU 임곗값입니다. 손 랜드마크er의 동영상 모드 및 스트림 모드에서는 추적에 실패하면 손 랜드마크 도구가 손 감지를 트리거합니다. 그러지 않으면 손 감지를 건너뜁니다.                                                   | 0.0 - 1.0                   | 0.5            |
| result_callback               | 손 랜드마크 기계가 라이브 스트림 모드일 때 감지 결과를 비동기식으로 수신하도록 결과 리스너를 설정합니다. 실행 모드가 LIVE_STREAM로 설정된 경우에만 적용됩니다.                                                                                                                                                                          | 해당 사항 없음              | 해당 사항 없음 |

또한, 각 손가락의 위치는 아래와 같이 번호와 텍스트로 구분된다.

![hand landmarks](https://ai.google.dev/static/mediapipe/images/solutions/hand-landmarks.png?hl=ko)

손 랜드마크 모델 번들에는 손바닥 감지 모델과 손 랜드마크 감지 모델이 포함되어 있고, 손바닥 감지 모델은 입력 이미지 내에서 손을 찾고 손 랜드마크 감지 모델은 손바닥 감지 모델에서 정의한 잘린 손 이미지에서 특정 손 표시를 식별한다.

[공식 소개 페이지(파이썬 예제 코드)](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/python?hl=ko)에서 제공하는 예제 코드는 아래와 같다.

```python
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
HandLandmarker = mp.tasks.vision.HandLandmarker
HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
HandLandmarkerResult = mp.tasks.vision.HandLandmarkerResult
VisionRunningMode = mp.tasks.vision.RunningMode

# Create a hand landmarker instance with the live stream mode:
def print_result(result: HandLandmarkerResult, output_image: mp.Image, timestamp_ms: int):
    print('hand landmarker result: {}'.format(result))

options = HandLandmarkerOptions(
    base_options=BaseOptions(model_asset_path='/path/to/model.task'),
    running_mode=VisionRunningMode.LIVE_STREAM,
    result_callback=print_result)
with HandLandmarker.create_from_options(options) as landmarker:
  # The landmarker is initialized. Use it here.
  # ...
```

위 코드와 비슷하게 손가락을 인식시키는 코드를 작성해도 되지만, `model.task` 파일을 항상 코드와 함께 배포해야 하는 불편한점이 있었다.

그래서 모델 파일 없이 사용할 수 있는 방법을 찾던 도중, `mediapipe` 라이브러리의 `solutions` 클래스를 이용하는 방법을 찾아냈다.

그 방법은 아래와 같다.

```python
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    min_detection_confidence=0.5, 
    min_tracking_confidence=0.5, 
    max_num_hands=2
)
mp_draw = mp.solutions.drawing_utils
```

위 코드와 같이 `mediapipe.solutions` 클래스를 이용하면, 내장된 모델을 통해 작동하므로 더이상 모델 파일을 함께 배포할 필요가 없어진다!

이를 통해 PC에서 미리 동작을 확인해보기 위한 코드를 `opencv`와 함께 작성해보았다.

```python
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
cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

while cap.isOpened():
    # 프레임 읽기
    success, frame = cap.read()
    if not success:
        continue

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
cap.release()
cv2.destroyAllWindows()
hands.close()
```

확인해보면 잘 동작한다.

