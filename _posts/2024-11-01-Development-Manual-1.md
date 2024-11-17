---
title: 시스템 개발 매뉴얼 1
date: 2024-11-01 17:16:11 +0900
categories: [LAB]
tags: [manual]     # TAG names should always be lowercase
toc: true
comments: false
---

# 시스템 개발 매뉴얼 1

> 라즈베리파이 카메라 인식 및 화면에 표시하기

라즈베리파이에서 전용 모듈을 통한 카메라를 이용하려면 기존의 PC에서 사용하던 방식인 [OpenCV](https://opencv.org/)를 이용하는 것이 아닌, [Picamera2](https://github.com/raspberrypi/picamera2)를 이용해야 한다.

그래도 우선 기존의 [OpenCV](https://opencv.org/)를 이용하여 카메라를 띄우는 예제를 보자면,
```python
import cv2 as cv
import numpy as np
from PIL import Image
import os
import time

try:
    cap = cv.VideoCapture(0, cv.CAP_DSHOW) # cv.CAP_DSHOW 는 윈도우에서 카메라 성능을 높이기 위한 플래그.
except:
    print("camera_error1")

while True:
    try:
        ret, frame = cap.read()

        if not ret:
            print("camera_error2")
            break
        
        cv.imshow(frame)
    except:
        print("camera_error3")
```

이런 방식이지만, 라즈베리파이에서는 [Picamera2](https://github.com/raspberrypi/picamera2)를 이용하여 아래와 같은 방식으로 카메라를 표시할 수 있다.

```python
import cv2 as cv
from picamera2 import Picamera2

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
    success, frame = True, cap.capture_array()
    if not success:
        print("camera_error2")
        break
    cv.imshow(frame)
```

우선, 라즈베리파이에서 picamera2를 설치하려면 아무것도 하지 않아도 된다.

만약 Raspberry PI OS를 이용한다면 이미 패키지의 형태로 `python3-picamera2`가 설치되어 있다.

하지만 다른 라이브러리를 또 설치한 후에 위에 있는 코드를 실행시키면 `no module named picamera2`  라는 오류가 발생하면서, 실행이 되지 않는 것을 볼 수 있다.

이상한 일이다. 분명 아까는 기본적으로 설치되어 있는 라이브러리라고 했는데 왜 파이썬 스크립트를 실행시키면 모듈을 찾을 수 없다고 나올까?

나는 이 오류에 대해 일주일 이상을 고민했었고, 답을 찾았다.

기본적으로 최신 버전의 Raspberry PI OS에서는 Global Environment에서의 PIP를 통한 라이브러리 설치를 금지한다.

그래서 아까 말했던 `python3-picamera2`와 같은 패키지 형태로 라이브러리가 설치되어 있다는 것을 알아내었다.

그렇다면 답은 하나 밖에 남지 않는다.

바로 `python virtual environment`.

venv를 이용하기 위해서는 venv 모듈이 설치되어 있어야 하지만, 최신 버전의 Raspberry Pi OS에서는 이미 설치되어 있기 때문에 생략한다.

> 앞으로는 venv, 파이썬 가상환경 둘 다 동일한 의미로 얘기하겠다.

리눅스 환경에서 파이썬 가상환경을 생성하고 적용하는 방법은 아래와 같다.

```bash
python3 -m venv venv
source venv/bin/activate
```

위의 명령어를 터미널에 입력하게 되면 사용자 이름 앞쪽에 `(venv)` 라는 문구가 추가되고, 우리는 비로소 가상환경에 진입하게 된 것이다.

이제, 다시 평소 하던대로 라이브러리를 설치하고 실행시켜보자.

> 파이썬 가상환경과 실제 Raspberry Pi OS에 설치된 파이썬 라이브러리들이 가상환경이라는 벽으로 격리되어 있기 때문에 새로 라이브러리들을 설치해줘야 한다.

하지만 또 `no module named ...`라는 오류가 발생한다.

다행히도, 이것에 대한 문제는 여러 시도를 해 보던 중 빠르게 해결되었다.

바로, 기존 시스템에 설치되어있는 라이브러리를 그대로 복사해오면 된다는 것이였다.

가상환경에서 나간 후 아래 커맨드를 입력하게 되면

> 기존 가상환경은 삭제하지 않아도 덮어쓰기가 된다!

```bash
python3 -m venv venv --system-site-packages
```

기존에 가상환경을 만들때와는 다르게 조금 시간이 걸리고, 아까와 같이 가상환경에 진입해주면 된다.

이제 아까 `Picamera2` 로 작성된 파이썬 코드를 실행시켜 보면 카메라가 잘 동작되는것을 알 수 있다.

