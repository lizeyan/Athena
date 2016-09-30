#-------------------------------------------------
#
# Project created by QtCreator 2016-09-30T16:15:43
#
#-------------------------------------------------

QT       += core gui

greaterThan(QT_MAJOR_VERSION, 4): QT += widgets

TARGET = Tcamera
TEMPLATE = app


SOURCES += main.cpp\
        mainwindow.cpp

HEADERS  += mainwindow.h

FORMS    += mainwindow.ui


INCLUDEPATH+=D:\OpenCV\build\install\include\opencv\
                    D:\OpenCV\build\install\include\opencv2\
                    D:\OpenCV\build\install\include

LIBS+=D:\OpenCV\build\lib\libopencv_calib3d2413.dll.a\
        D:\OpenCV\build\lib\libopencv_contrib2413.dll.a\
        D:\OpenCV\build\lib\libopencv_core2413.dll.a\
        D:\OpenCV\build\lib\libopencv_features2d2413.dll.a\
        D:\OpenCV\build\lib\libopencv_flann2413.dll.a\
        D:\OpenCV\build\lib\libopencv_gpu2413.dll.a\
        D:\OpenCV\build\lib\libopencv_highgui2413.dll.a\
        D:\OpenCV\build\lib\libopencv_imgproc2413.dll.a\
        D:\OpenCV\build\lib\libopencv_legacy2413.dll.a\
        D:\OpenCV\build\lib\libopencv_ml2413.dll.a\
        D:\OpenCV\build\lib\libopencv_objdetect2413.dll.a\
       D:\OpenCV\build\lib\libopencv_video2413.dll.a
