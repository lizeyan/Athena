# PRJ2--基于人脸识别的校园智能签到系统
---

Author: PlusOneSecond

1. 人脸识别终端 Terminal
    一个利用摄像头检测摄取到的人脸并进行识别，将结果传递到后台的程序。运行在部署到校园各处的终端设备中。
2. 签到系统云平台 CloudService
    为系统的所有前台程序提供支持。管理系统的数据库，提供Http请求形式的API结构供调用。
    云平台还包括一系列的前端页面。
3. 智能签到Android App
    智能签到系统的手机端APP，用于用户管理个人信息，查看考勤情况。

子系统|开发语言|开发框架|适配平台
---|---|---|---
Term|c++|Qt5.7 +|Windows
CloudService|Python3.5 +|Django1.10 +|Linux
AndroidApp|Java|Android5.0 +|Android5.0 +
